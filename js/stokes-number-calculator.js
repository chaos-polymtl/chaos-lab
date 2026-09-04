/**
 * Stokes Number Calculator
 * Computes the particle relaxation time (Stokes-drag regime), the flow time
 * scale, and the resulting Stokes number St = tau_p / tau_f for a spherical
 * particle carried by a fluid flow.
 *
 *   tau_p = rho_p * d_p^2 / (18 * mu)
 *   tau_f = L_c / U
 *   St    = tau_p / tau_f
 *
 * Dependencies: physics-utils.js
 */
(function () {
  "use strict";

  const { validatePositive } = window.PhysicsUtils;

  let elements = null;

  /**
   * Get (re-resolve) DOM element references.
   * @returns {Object|null} references, or null if the tool is absent on the page.
   */
  function getElements() {
    const container = document.getElementById("stokes-tool");
    if (!container) return null;

    elements = {
      inputs: {
        diameter: document.getElementById("stokes-diameter"),
        density: document.getElementById("stokes-density"),
        viscosity: document.getElementById("stokes-viscosity"),
        velocity: document.getElementById("stokes-velocity"),
        length: document.getElementById("stokes-length"),
      },
      outputs: {
        taup: document.getElementById("stokes-taup"),
        tauf: document.getElementById("stokes-tauf"),
        stokes: document.getElementById("stokes-number"),
      },
    };
    return elements;
  }

  /** Format a (typically small) value in scientific notation. */
  function formatScientific(value) {
    if (!isFinite(value)) return "-";
    return value.toExponential(3);
  }

  /** Format the Stokes number with a sensible number of significant digits. */
  function formatStokes(value) {
    if (!isFinite(value)) return "-";
    return value.toLocaleString(undefined, { maximumSignificantDigits: 3 });
  }

  /** Mark all outputs as invalid. */
  function showInvalid(el) {
    el.outputs.taup.textContent = "invalid input";
    el.outputs.tauf.textContent = "-";
    el.outputs.stokes.textContent = "-";
  }

  /** Read inputs, compute the relaxation time, flow time and Stokes number. */
  function update() {
    const el = elements || getElements();
    if (!el) return;

    const d = parseFloat(el.inputs.diameter.value);
    const rho = parseFloat(el.inputs.density.value);
    const mu = parseFloat(el.inputs.viscosity.value);
    const U = parseFloat(el.inputs.velocity.value);
    const Lc = parseFloat(el.inputs.length.value);

    if (!validatePositive([d, rho, mu, U, Lc])) {
      showInvalid(el);
      return;
    }

    const tauP = (rho * d * d) / (18 * mu); // particle relaxation time
    const tauF = Lc / U; // flow time scale
    const St = tauP / tauF;

    el.outputs.taup.textContent = formatScientific(tauP);
    el.outputs.tauf.textContent = formatScientific(tauF);
    el.outputs.stokes.textContent = formatStokes(St);
  }

  /** Wire up live recomputation and run an initial calculation. */
  function init() {
    const el = getElements();
    if (!el) return;

    Object.values(el.inputs).forEach((input) => {
      input?.addEventListener("input", update);
    });

    update();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
