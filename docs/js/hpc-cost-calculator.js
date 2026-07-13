/**
 * HPC Job Cost Calculator
 * Converts a job size (number of cores) and wall-clock duration (hours) into
 * the equivalent allocation cost expressed in core-hours and core-years.
 *
 * Dependencies: none (self-contained).
 */
(function () {
  "use strict";

  // Hours in one year (365 days) — the convention used for core-year allocations.
  const HOURS_PER_YEAR = 24 * 365;

  let elements = null;

  /**
   * Get or cache DOM element references.
   * Re-resolves each call so the tool keeps working across MkDocs navigation.
   * @returns {Object|null} element references, or null if the tool is absent.
   */
  function getElements() {
    const container = document.getElementById("hpc-cost-tool");
    if (!container) return null;

    elements = {
      inputs: {
        cores: document.getElementById("hpc-cores"),
        hours: document.getElementById("hpc-hours"),
      },
      outputs: {
        coreHours: document.getElementById("hpc-core-hours"),
        coreYears: document.getElementById("hpc-core-years"),
      },
    };
    return elements;
  }

  /**
   * Format a number with thousands separators and up to 4 significant digits.
   * @param {number} value
   * @returns {string}
   */
  function formatNumber(value) {
    if (!isFinite(value)) return "-";
    return value.toLocaleString(undefined, { maximumSignificantDigits: 4 });
  }

  /** Read inputs, compute the costs, and write the results. */
  function update() {
    const el = elements || getElements();
    if (!el) return;

    const cores = parseFloat(el.inputs.cores.value);
    const hours = parseFloat(el.inputs.hours.value);

    if (!(cores > 0) || !(hours > 0)) {
      el.outputs.coreHours.textContent = "invalid input";
      el.outputs.coreYears.textContent = "-";
      return;
    }

    const coreHours = cores * hours;
    const coreYears = coreHours / HOURS_PER_YEAR;

    el.outputs.coreHours.textContent = formatNumber(coreHours);
    el.outputs.coreYears.textContent = formatNumber(coreYears);
  }

  /** Wire up event listeners and run an initial calculation. */
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
