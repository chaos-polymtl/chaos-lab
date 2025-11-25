document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("fluidization-tool");
  if (!container) return;

  const g = 9.81;

  const diameterInput = document.getElementById("mf-diameter");
  const rhoPInput = document.getElementById("mf-rho-p");
  const rhoFInput = document.getElementById("mf-rho-f");
  const muInput = document.getElementById("mf-mu");
  const eps0Input = document.getElementById("mf-epsilon0");
  const computeBtn = document.getElementById("mf-compute-btn");
  const modelInputs = document.querySelectorAll('input[name="mf_drag_model"]');

  const umfSpan = document.getElementById("mf-umf");
  const slipSpan = document.getElementById("mf-slip");
  const repSpan = document.getElementById("mf-rep");
  const modelNote = document.getElementById("mf-model-note");
  const plotDiv = document.getElementById("mf-plot");

  function baseDragCoefficient(Re) {
    if (Re <= 0) return 0.0;
    if (Re < 1000) {
      return (24.0 / Re) * (1.0 + 0.15 * Math.pow(Re, 0.687));
    }
    return 0.44;
  }

  // Hindrance correlations
  function diFeliceChi(Re) {
    const safeRe = Math.max(Re, 1e-9);
    const term = 1.5 - Math.log10(safeRe);
    return 3.7 - 0.65 * Math.exp(-(term * term) / 2.0);
  }

  function beetstraCd(Re, epsilon) {
    // Beetstra et al. (2007) style decomposition: viscous (∝ ε^-2) + inertial (∝ ε^-3)
    const safeRe = Math.max(Re, 1e-9);
    const viscous = (24.0 / safeRe) * (1.0 + 0.15 * Math.pow(safeRe, 0.687)) / (epsilon * epsilon);
    const inertial = 0.44 * (1.0 - epsilon) / Math.pow(epsilon, 3.0);
    return viscous + inertial;
  }

  function diFeliceCd(Re, epsilon) {
    const chi = diFeliceChi(Re);
    return baseDragCoefficient(Re) * Math.pow(epsilon, 2.0 - chi);
  }

  function tennetiCd(Re, epsilon) {
    // Tenneti et al. (2011) correlation: power-law hindrance on viscous drag + mild inertial lift
    const hindrance = Math.pow(epsilon, -2.65);
    const inertial = 0.5 * (1.0 - epsilon) / Math.max(epsilon, 1e-6);
    return baseDragCoefficient(Re) * hindrance + inertial;
  }

  function rongCd(Re, epsilon) {
    // Rong et al. correlation: viscous scaling ~ ε^-2.2 and slightly stronger inertial crowding
    const safeRe = Math.max(Re, 1e-9);
    const viscous = (24.0 / safeRe) * (1.0 + 0.15 * Math.pow(safeRe, 0.687)) / Math.pow(epsilon, 2.2);
    const inertial = 0.45 * (1.0 - epsilon) / Math.pow(epsilon, 3.0);
    return viscous + inertial;
  }

  function ergunCd(Re, epsilon) {
    // Ergun (1952) packed-bed terms plus Wen–Yu (1966) single-sphere contribution
    const eps = Math.max(epsilon, 1e-6);
    const safeRe = Math.max(Re, 1e-9);
    const ergunViscous = (150.0 * (1.0 - eps)) / (Math.pow(eps, 3.0) * safeRe);
    const ergunInertial = 1.75 / Math.pow(eps, 3.0);
    const wenYu = (24.0 / safeRe) * (1.0 + 0.15 * Math.pow(safeRe, 0.687)) / (eps * eps);
    return ergunViscous + ergunInertial + wenYu;
  }

  function hinderedDragCoefficient(Re, epsilon, model) {
    const eps = Math.min(Math.max(epsilon, 1e-4), 0.99);
    if (model === "beetstra") return beetstraCd(Re, eps);
    if (model === "di-felice") return diFeliceCd(Re, eps);
    if (model === "tenneti") return tennetiCd(Re, eps);
    if (model === "rong") return rongCd(Re, eps);
    if (model === "ergun") return ergunCd(Re, eps);
    return baseDragCoefficient(Re);
  }

  function dragForce(rho_f, mu, D, slip, epsilon, model) {
    const Re = Math.max((rho_f * slip * D) / mu, 1e-12);
    const Cd = hinderedDragCoefficient(Re, epsilon, model);
    const A = (Math.PI * D * D) / 4.0;
    return 0.5 * rho_f * Cd * A * slip * slip;
  }

  function particleWeight(rho_p, rho_f, D) {
    const volume = (Math.PI * Math.pow(D, 3)) / 6.0;
    return (rho_p - rho_f) * g * volume;
  }

  function getSelectedModel() {
    let model = "beetstra";
    modelInputs.forEach((r) => {
      if (r.checked) model = r.value;
    });
    return model;
  }

  function updateModelNote(model) {
    if (!modelNote) return;
    const label = {
      beetstra: "Beetstra et al. (2007)",
      "di-felice": "Di Felice (1994)",
      tenneti: "Tenneti et al. (2011)",
      rong: "Rong et al. (2015)",
      ergun: "Ergun (1952) + Wen–Yu (1966)",
    }[model] || "Selected model";
    modelNote.textContent = label;
  }

  function solveSlipVelocity(params, epsilon, model) {
    const { rho_p, rho_f, mu, D } = params;
    const weight = particleWeight(rho_p, rho_f, D);
    const stokesGuess = ((rho_p - rho_f) * g * D * D) / (18.0 * mu);
    let v = Math.max(1e-5, stokesGuess / Math.max(epsilon, 0.2));

    for (let i = 0; i < 60; i++) {
      const f = dragForce(rho_f, mu, D, v, epsilon, model) - weight;
      const dv = Math.max(v * 0.05, 1e-6);
      const f2 = dragForce(rho_f, mu, D, v + dv, epsilon, model) - weight;
      const jac = (f2 - f) / dv;

      let step = -f / jac;
      // keep Newton step reasonable
      step = Math.max(Math.min(step, v), -0.8 * v);

      v += step;
      if (v <= 0 || !Number.isFinite(v)) v = Math.max(Math.abs(step), 1e-5);
      if (Math.abs(step) / v < 1e-6) break;
    }
    return v;
  }

  function expansionTrace(params, epsilon0, model) {
    const epsMin = Math.max(epsilon0, 0.35);
    const epsMax = 0.95;
    const steps = 40;
    const epsilons = [];
    const superficial = [];
    const ratios = [];

    for (let i = 0; i < steps; i++) {
      const eps = epsMin + ((epsMax - epsMin) * i) / (steps - 1);
      const slip = solveSlipVelocity(params, eps, model);
      const U = eps * slip;
      const ratio = (1.0 - epsilon0) / (1.0 - eps);

      epsilons.push(eps);
      superficial.push(U);
      ratios.push(ratio);
    }
    return { superficial, ratios };
  }

  function plotExpansion(params, epsilon0, model) {
    if (typeof Plotly === "undefined" || !plotDiv) return;
    const series = expansionTrace(params, epsilon0, model);

    const trace = {
      x: series.superficial,
      y: series.ratios,
      mode: "lines",
      name: "Bed expansion",
      line: { color: "#2962ff", width: 3 },
      hovertemplate: "U = %{x:.3g} m/s<br>H/H₀ = %{y:.3g}<extra></extra>",
    };

    const layout = {
      xaxis: { title: "Superficial fluid velocity U [m/s]" },
      yaxis: { title: "Bed expansion H/H₀" },
      margin: { t: 10, r: 10, b: 60, l: 60 },
      height: 320,
      showlegend: false,
    };

    Plotly.newPlot(plotDiv, [trace], layout, { responsive: true });
  }

  function update() {
    const D = parseFloat(diameterInput.value);
    const rho_p = parseFloat(rhoPInput.value);
    const rho_f = parseFloat(rhoFInput.value);
    const mu = parseFloat(muInput.value);
    const epsilon0 = parseFloat(eps0Input.value);

    const inputsOk = [D, rho_p, rho_f, mu, epsilon0].every((v) => Number.isFinite(v) && v > 0);
    if (!inputsOk || epsilon0 >= 1) {
      umfSpan.textContent = "invalid input";
      slipSpan.textContent = "–";
      repSpan.textContent = "–";
      return;
    }

    const model = getSelectedModel();
    updateModelNote(model);

    const params = { rho_p, rho_f, mu, D };
    const slip = solveSlipVelocity(params, epsilon0, model);
    const umf = epsilon0 * slip;
    const Rep = (rho_f * slip * D) / mu;

    umfSpan.textContent = umf.toExponential(3);
    slipSpan.textContent = slip.toExponential(3);
    repSpan.textContent = Rep.toExponential(3);

    plotExpansion(params, epsilon0, model);
  }

  computeBtn.addEventListener("click", update);

  [diameterInput, rhoPInput, rhoFInput, muInput, eps0Input].forEach((input) => {
    input.addEventListener("change", update);
  });

  modelInputs.forEach((r) => {
    r.addEventListener("change", update);
  });

  update();
});
