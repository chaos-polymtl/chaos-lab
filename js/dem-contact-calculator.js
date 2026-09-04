/**
 * DEM Rayleigh Time & Contact Overlap Calculator
 * For a spherical particle, computes the Rayleigh critical time (used to pick a
 * DEM time step) and, for a given impact velocity, the maximum Hertzian contact
 * overlap during a sphere-sphere collision of two identical particles.
 *
 * Dependencies: physics-utils.js
 */
(function () {
  "use strict";

  const { sphereVolume, validatePositive } = window.PhysicsUtils;

  let elements = null;

  /**
   * Get (re-resolve) DOM element references.
   * @returns {Object|null} references, or null if the tool is absent on the page.
   */
  function getElements() {
    const container = document.getElementById("dem-contact-tool");
    if (!container) return null;

    elements = {
      inputs: {
        diameter: document.getElementById("dem-diameter"),
        density: document.getElementById("dem-density"),
        young: document.getElementById("dem-young"),
        poisson: document.getElementById("dem-poisson"),
        velocity: document.getElementById("dem-velocity"),
      },
      outputs: {
        rayleigh: document.getElementById("dem-rayleigh"),
        overlap: document.getElementById("dem-overlap"),
        overlapPct: document.getElementById("dem-overlap-pct"),
      },
    };
    return elements;
  }

  /** Format a (typically small) value in scientific notation. */
  function formatScientific(value) {
    if (!isFinite(value)) return "-";
    return value.toExponential(3);
  }

  /** Format the overlap percentage with a sensible number of digits. */
  function formatPercent(value) {
    if (!isFinite(value)) return "-";
    return value.toLocaleString(undefined, { maximumSignificantDigits: 3 });
  }

  /** Mark all outputs as invalid. */
  function showInvalid(el) {
    el.outputs.rayleigh.textContent = "invalid input";
    el.outputs.overlap.textContent = "-";
    el.outputs.overlapPct.textContent = "-";
  }

  /** Read inputs, compute Rayleigh time and max overlap, and write results. */
  function update() {
    const el = elements || getElements();
    if (!el) return;

    const d = parseFloat(el.inputs.diameter.value);
    const rho = parseFloat(el.inputs.density.value);
    const E = parseFloat(el.inputs.young.value);
    const nu = parseFloat(el.inputs.poisson.value);
    const v = parseFloat(el.inputs.velocity.value);

    // Diameter, density, modulus and velocity must be strictly positive; the
    // Poisson ratio must lie in the physically meaningful open range (0, 0.5).
    if (!validatePositive([d, rho, E, v]) || !(nu > 0 && nu < 0.5)) {
      showInvalid(el);
      return;
    }

    const R = d / 2;
    const G = E / (2 * (1 + nu)); // shear modulus
    const m = rho * sphereVolume(d); // particle mass

    // Rayleigh critical time.
    const tRayleigh =
      (Math.PI * R * Math.sqrt(rho / G)) / (0.1631 * nu + 0.8766);

    // Maximum Hertzian overlap for two identical spheres (energy balance).
    const Rstar = R / 2;
    const mStar = m / 2;
    const Estar = E / (2 * (1 - nu * nu));
    const deltaMax = Math.pow(
      (15 * mStar * v * v) / (16 * Estar * Math.sqrt(Rstar)),
      2 / 5
    );
    const deltaPct = (deltaMax / d) * 100;

    el.outputs.rayleigh.textContent = formatScientific(tRayleigh);
    el.outputs.overlap.textContent = formatScientific(deltaMax);
    el.outputs.overlapPct.textContent = formatPercent(deltaPct);
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
