document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("drag-calculator");
  if (!container) return;

  const g = 9.81;

  const diameterInput = document.getElementById("diameter");
  const rhoPInput = document.getElementById("rho_p");
  const rhoFInput = document.getElementById("rho_f");
  const muInput = document.getElementById("mu");
  const computeBtn = document.getElementById("compute-btn");

  const modelInputs = document.querySelectorAll('input[name="drag_model"]');

  const vtSpan = document.getElementById("vt");
  const RepSpan = document.getElementById("Rep");
  const CdSpan = document.getElementById("Cd");

  const plotDiv = document.getElementById("drag-plot");

  function computeInitialTerminalVelocity(D, rho_p, rho_f, mu) {
    // Stokes regime: v_t = ( (ρ_p - ρ_f) g D² ) / (18 μ)
    return ((rho_p - rho_f) * g * D * D) / (18.0 * mu);
  }

  function dragCoefficient(Re, model) {
    if (Re <= 0) return 0.0;

    if (model === "clift-gauvin") {
    // Clift–Gauvin correlation (incompressible, smooth sphere)
    // Cd = 24/Re * (1 + 0.15 Re^0.687) + 0.42 / (1 + 42500 Re^-1.16)
    const term1 = (24.0 / Re) * (1.0 + 0.15 * Math.pow(Re, 0.687));
    const term2 = 0.42 / (1.0 + 42500.0 * Math.pow(Re, -1.16));
    return term1 + term2;
    }

    if (model === "schiller-naumann") {
      // Schiller–Naumann: Cd = 24/Re * (1 + 0.15 Re^0.687), Re <~ 1000
      // and ~0.44 at higher Re
      if (Re < 1000) {
        return (24.0 / Re) * (1.0 + 0.15 * Math.pow(Re, 0.687));
      }
      return 0.44;
    }

    // Default: Stokes
    return 24.0 / Re;
  }

  function computeDragForce(rho_f, mu, D, v, model) 
  {
    const Re = (rho_f * v * D) / mu;
    const Cd = dragCoefficient(Re, model);
    const A = Math.PI * (D * D) / 4.0;
    return 0.5 * rho_f * Cd * A * v * v;
  }

  function computeGravityForce(rho_p, rho_f, D, g) 
  {
    return (rho_p - rho_f) * g * D * D * D * (Math.PI / 6.0);
  }

  function computeForceBalance(rho_p, rho_f, mu, D, v, model) 
  {
    return computeGravityForce(rho_p, rho_f, D, g) - computeDragForce(rho_f, mu, D, v, model);
  }

  function getSelectedModel() {
      let model = "stokes";
      modelInputs.forEach((r) => {
        if (r.checked) {
          model = r.value;
        }
      });
      return model;
    }
  const cdEquationDiv = document.getElementById("cd-equation");

  function cdEquationHtml(model) {
    if (model === "schiller-naumann") {
      return (
        "C<sub>D</sub> = " +
        "24 / Re<sub>p</sub> · (1 + 0.15 Re<sub>p</sub><sup>0.687</sup>)" +
        "<br><span style='opacity:0.75'>(Schiller–Naumann)</span>"
      );
    }

    if (model === "clift-gauvin") {
      return (
        "C<sub>D</sub> = " +
        "24 / Re<sub>p</sub> · (1 + 0.15 Re<sub>p</sub><sup>0.687</sup>)" +
        " + 0.42 / (1 + 42500 Re<sub>p</sub><sup>-1.16</sup>)" +
        "<br><span style='opacity:0.75'>(Clift–Gauvin)</span>"
      );
    }

    // Default: Stokes
    return (
      "C<sub>D</sub> = 24 / Re<sub>p</sub>" +
      "<br><span style='opacity:0.75'>(Stokes)</span>"
    );
  }

  function updateCdEquation(model) {
  if (!cdEquationDiv) return;
  cdEquationDiv.innerHTML = cdEquationHtml(model);
  }
  

  function update() {
    const D = parseFloat(diameterInput.value);
    const rho_p = parseFloat(rhoPInput.value);
    const rho_f = parseFloat(rhoFInput.value);
    const mu = parseFloat(muInput.value);

    if (![D, rho_p, rho_f, mu].every((v) => Number.isFinite(v) && v > 0)) {
      vtSpan.textContent = "invalid input";
      fdSpan.textContent = "invalid input";
      return;
    }

    const model = getSelectedModel();

    err = 1;
    eps = 1e-6
    vt = computeInitialTerminalVelocity(D, rho_p, rho_f, mu);
    while (err > 1e-6) {
      vt_eps = vt + eps;
      Jacobian = (computeForceBalance(rho_p, rho_f, mu, D, vt_eps, model) - computeForceBalance(rho_p, rho_f, mu, D, vt, model)) / eps;

      delta_vt = -computeForceBalance(rho_p, rho_f, mu, D, vt, model) / Jacobian;
      vt = vt + delta_vt;
      err = Math.abs(delta_vt) / vt;
    }
    Rep = (rho_f * vt * D) / mu;
    Cd = dragCoefficient(Rep, model);
    CdSpan.textContent = Cd.toExponential(3);
    vtSpan.textContent = vt.toExponential(3);
    RepSpan.textContent = Rep.toExponential(3);
    updateCdEquation(model);   // <--- update equation display

  }

  

  computeBtn.addEventListener("click", update);

  [diameterInput, rhoPInput, rhoFInput, muInput].forEach((input) => {
    input.addEventListener("change", update);
  });

  // Recompute when drag model changes
  modelInputs.forEach((r) => {
    r.addEventListener("change", update);
  });

  // Initial plot + numbers
  update();
});
