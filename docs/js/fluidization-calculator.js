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
  const voidagePlotDiv = document.getElementById("mf-voidage-plot");

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

  function wenYuCd(Re, epsilon) {
    // Wen–Yu (1966) single-sphere drag with ε scaling
    const eps = Math.max(epsilon, 1e-6);
    const safeRe = Math.max(Re, 1e-9);
    return (24.0 / safeRe) * (1.0 + 0.15 * Math.pow(safeRe, 0.687)) / (eps * eps);
  }

  function hinderedDragCoefficient(Re, epsilon, model) {
    const eps = Math.min(Math.max(epsilon, 1e-4), 0.99);
    if (model === "beetstra") return beetstraCd(Re, eps);
    if (model === "di-felice") return diFeliceCd(Re, eps);
    if (model === "tenneti") return tennetiCd(Re, eps);
    if (model === "rong") return rongCd(Re, eps);
    if (model === "wen-yu") return wenYuCd(Re, eps);
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

  function getSelectedModels() {
    const selected = [];
    modelInputs.forEach((r) => {
      if (r.checked) selected.push(r.value);
    });
    return selected.length ? selected : ["tenneti"];
  }

  function modelLabel(model) {
    return {
      beetstra: "Beetstra (2007)",
      "di-felice": "Di Felice (1994)",
      tenneti: "Tenneti (2011)",
      rong: "Rong (2015)",
      "wen-yu": "Wen–Yu (1966)",
    }[model] || model;
  }

  function updateModelNote(models) {
    if (!modelNote) return;
    modelNote.innerHTML = models.map((m) => modelLabel(m)).join("<br>");
  }

  function solveSlipVelocity(params, epsilon, model) {
    const { rho_p, rho_f, mu, D } = params;
    const weight = particleWeight(rho_p, rho_f, D);
    const stokesGuess = ((rho_p - rho_f) * g * D * D) / (18.0 * mu);
    let v = Math.max(1e-5, stokesGuess / Math.max(epsilon, 0.2));

    for (let i = 0; i < 100; i++) {
      const f = dragForce(rho_f, mu, D, v, epsilon, model) - weight;
      const dv = Math.max(v * 0.01, 1e-6);
      const f2 = dragForce(rho_f, mu, D, v + dv, epsilon, model) - weight;
      const jac = (f2 - f) / dv;

      let delta = -f / jac;
      // keep Newton step reasonable. If the step is 10% or more of current value, limit it to 10%
      if (Math.abs(delta/v) > 0.1) delta = 0.1*delta;

      v += delta;
      if (v <= 0 || !Number.isFinite(v)) v = Math.max(Math.abs(delta), 1e-5);
      if (Math.abs(delta) / v < 1e-6) break;
    }
    return v;
  }

  function expansionTrace(params, epsilon0, model) {
    const epsMin = Math.max(epsilon0, 0.35);
    const epsMax = 0.95;
    const steps = 100;
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

  function plotExpansion(params, epsilon0, models) {
    if (typeof Plotly === "undefined" || !plotDiv) return;
    const colors = ['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02'];
    const traces = models.map((model, idx) => {
      const series = expansionTrace(params, epsilon0, model);
      return {
        x: series.superficial,
        y: series.ratios,
        mode: "lines",
        name: modelLabel(model),
        line: { color: colors[idx % colors.length], width: 3 },
        hovertemplate: `${modelLabel(model)}<br>U = %{x:.3g} m/s<br>H/H₀ = %{y:.3g}<extra></extra>`,
      };
    });

    const layout = {
      xaxis: { title: "Superficial fluid velocity U [m/s]" },
      yaxis: { title: "Bed expansion H/H₀" },
      margin: { t: 10, r: 10, b: 60, l: 60 },
      height: 320,
      font: { size: 14 },
      showlegend: models.length > 1,
    };

    Plotly.newPlot(plotDiv, traces, layout, { responsive: true });
  }

  function voidageSweep(params, models) {
    const solidsMin = 0.0; // 1 - epsilon
    const solidsMax = 0.7; // up to epsilon = 0.3
    const steps = 100;
    const colors = ['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02'];

    return models.map((model, idx) => {
      const solids = [];
      const velocities = [];
      for (let i = 0; i < steps; i++) {
        const solidFrac = solidsMin + ((solidsMax - solidsMin) * i) / (steps - 1);
        const eps = 1.0 - solidFrac;
        const slip = solveSlipVelocity(params, eps, model);
        solids.push(solidFrac);
        velocities.push(eps * slip);
      }
      return {
        x: solids,
        y: velocities,
        mode: "lines",
        name: modelLabel(model),
        line: { color: colors[idx % colors.length], width: 3 },
        hovertemplate: `${modelLabel(model)}<br>φ = %{x:.3f}<br>U = %{y:.3g} m/s<extra></extra>`,
      };
    });
  }

  function plotVoidageVelocity(params, models) {
    if (typeof Plotly === "undefined" || !voidagePlotDiv) return;
    const traces = voidageSweep(params, models);
    const layout = {
      xaxis: { title: "Solid fraction φ = 1 − ε [–]", range: [0, 0.7] },
      yaxis: { title: "Superficial velocity U [m/s]" },
      margin: { t: 10, r: 10, b: 60, l: 60 },
      height: 320,
      font: { size: 14 },
      showlegend: models.length > 1,
    };
    Plotly.newPlot(voidagePlotDiv, traces, layout, { responsive: true });
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

    const models = getSelectedModels();
    updateModelNote(models);

    const params = { rho_p, rho_f, mu, D };
    const results = models.map((model) => {
      const slip = solveSlipVelocity(params, epsilon0, model);
      const umf = epsilon0 * slip;
      const Rep = (rho_f * slip * D) / mu;
      return { model, slip, umf, Rep };
    });

    const fmt = (val) => (Number.isFinite(val) ? val.toExponential(3) : "–");
    umfSpan.innerHTML = results.map((r) => `${modelLabel(r.model)}: ${fmt(r.umf)}`).join("<br>");
    slipSpan.innerHTML = results.map((r) => `${modelLabel(r.model)}: ${fmt(r.slip)}`).join("<br>");
    repSpan.innerHTML = results.map((r) => `${modelLabel(r.model)}: ${fmt(r.Rep)}`).join("<br>");

    plotExpansion(params, epsilon0, models);
    plotVoidageVelocity(params, models);
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
