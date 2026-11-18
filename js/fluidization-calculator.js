/**
 * Fluidization Calculator
 * Interactive tool for calculating minimum fluidization velocity and bed expansion.
 *
 * Dependencies: physics-utils.js, drag-models.js, plot-utils.js, Plotly
 */
(function () {
  "use strict";

  // Import from shared modules
  const {
    GRAVITY,
    reynoldsNumber,
    particleWeight,
    dragForce,
    sphereCrossSection,
    stokesTerminalVelocity,
    newtonRaphson,
    validatePositive,
    safeValue,
  } = window.PhysicsUtils;

  const { computeHinderedCd, getModelLabel } = window.DragModels;

  const {
    linspace,
    createLayout,
    createLineTrace,
    renderPlot,
    formatScientific,
  } = window.PlotUtils;

  // ============================================================================
  // Configuration
  // ============================================================================

  const CONFIG = {
    expansionSteps: 100,
    voidageMin: 0.35,
    voidageMax: 0.9,
    solidsMin: 0.0,
    solidsMax: 0.7,
  };

  // ============================================================================
  // DOM Elements
  // ============================================================================

  let elements = null;

  /**
   * Get or cache DOM element references.
   * @returns {Object|null} Object with element references or null if container not found
   */
  function getElements() {
    if (elements) return elements;

    const container = document.getElementById("fluidization-tool");
    if (!container) return null;

    elements = {
      container,
      inputs: {
        diameter: document.getElementById("mf-diameter"),
        rhoP: document.getElementById("mf-rho-p"),
        rhoF: document.getElementById("mf-rho-f"),
        mu: document.getElementById("mf-mu"),
        epsilon0: document.getElementById("mf-epsilon0"),
      },
      computeBtn: document.getElementById("mf-compute-btn"),
      modelInputs: document.querySelectorAll('input[name="mf_drag_model"]'),
      outputs: {
        umf: document.getElementById("mf-umf"),
        slip: document.getElementById("mf-slip"),
        rep: document.getElementById("mf-rep"),
        modelNote: document.getElementById("mf-model-note"),
      },
      plots: {
        expansion: document.getElementById("mf-plot"),
        voidage: document.getElementById("mf-voidage-plot"),
      },
    };

    return elements;
  }

  // ============================================================================
  // Physics Calculations
  // ============================================================================

  /**
   * Calculate drag force using hindered drag model.
   * @param {Object} params - Fluid/particle parameters
   * @param {number} slip - Slip velocity [m/s]
   * @param {number} epsilon - Voidage [-]
   * @param {string} modelId - Drag model identifier
   * @returns {number} Drag force [N]
   */
  function computeHinderedDragForce(params, slip, epsilon, modelId) {
    const { rhoF, mu, D } = params;
    const Re = safeValue(reynoldsNumber(rhoF, slip, D, mu), 1e-12);
    const Cd = computeHinderedCd(Re, epsilon, modelId);
    return dragForce(rhoF, Cd, D, slip);
  }

  /**
   * Solve for slip velocity at a given voidage using Newton-Raphson.
   * At equilibrium: drag force = particle weight
   * @param {Object} params - Fluid/particle parameters
   * @param {number} epsilon - Voidage [-]
   * @param {string} modelId - Drag model identifier
   * @returns {number} Slip velocity [m/s]
   */
  function solveSlipVelocity(params, epsilon, modelId) {
    const { rhoP, rhoF, mu, D } = params;
    const weight = particleWeight(rhoP, rhoF, D);

    // Initial guess from Stokes law, adjusted for voidage
    const stokesGuess = stokesTerminalVelocity(rhoP, rhoF, D, mu);
    const initialGuess = Math.max(1e-5, stokesGuess / Math.max(epsilon, 0.2));

    // Force balance: F_drag - W = 0
    const forceBalance = (v) =>
      computeHinderedDragForce(params, v, epsilon, modelId) - weight;

    return newtonRaphson(forceBalance, initialGuess, {
      maxStep: 0.1,
      minValue: 1e-5,
    });
  }

  // ============================================================================
  // Data Generation
  // ============================================================================

  /**
   * Generate bed expansion data (H/H0 vs superficial velocity).
   * @param {Object} params - Fluid/particle parameters
   * @param {number} epsilon0 - Packed bed voidage [-]
   * @param {string} modelId - Drag model identifier
   * @returns {Object} Arrays of superficial velocities and H/H0 ratios
   */
  function computeExpansionData(params, epsilon0, modelId) {
    const epsMin = Math.max(epsilon0, CONFIG.voidageMin);
    const epsilons = linspace(epsMin, CONFIG.voidageMax, CONFIG.expansionSteps);

    const superficial = [];
    const ratios = [];

    for (const eps of epsilons) {
      const slip = solveSlipVelocity(params, eps, modelId);
      const U = eps * slip;
      const ratio = (1.0 - epsilon0) / (1.0 - eps);

      superficial.push(U);
      ratios.push(ratio);
    }

    return { superficial, ratios };
  }

  /**
   * Generate voidage-velocity data (solid fraction vs superficial velocity).
   * @param {Object} params - Fluid/particle parameters
   * @param {string} modelId - Drag model identifier
   * @returns {Object} Arrays of solid fractions and superficial velocities
   */
  function computeVoidageData(params, modelId) {
    const solidFractions = linspace(
      CONFIG.solidsMin,
      CONFIG.solidsMax,
      CONFIG.expansionSteps
    );

    const solids = [];
    const velocities = [];

    for (const phi of solidFractions) {
      const eps = 1.0 - phi;
      const slip = solveSlipVelocity(params, eps, modelId);

      solids.push(phi);
      velocities.push(eps * slip);
    }

    return { solids, velocities };
  }

  // ============================================================================
  // Plotting
  // ============================================================================

  /**
   * Plot bed expansion curves for selected models.
   * @param {Object} params - Fluid/particle parameters
   * @param {number} epsilon0 - Packed bed voidage [-]
   * @param {string[]} modelIds - Array of model identifiers
   */
  function plotExpansion(params, epsilon0, modelIds) {
    const el = getElements();
    if (!el?.plots.expansion) return;

    const traces = modelIds.map((modelId, idx) => {
      const data = computeExpansionData(params, epsilon0, modelId);
      const label = getModelLabel(modelId, "hindered");

      return createLineTrace({
        x: data.superficial,
        y: data.ratios,
        name: label,
        colorIndex: idx,
        hoverTemplate: `${label}<br>U = %{x:.3g} m/s<br>H/H\u2080 = %{y:.3g}<extra></extra>`,
      });
    });

    const layout = createLayout({
      xTitle: "Superficial fluid velocity U [m/s]",
      yTitle: "Bed expansion H/H\u2080",
      showLegend: modelIds.length > 1,
    });

    renderPlot(el.plots.expansion, traces, layout);
  }

  /**
   * Plot voidage-velocity relationship for selected models.
   * @param {Object} params - Fluid/particle parameters
   * @param {string[]} modelIds - Array of model identifiers
   */
  function plotVoidageVelocity(params, modelIds) {
    const el = getElements();
    if (!el?.plots.voidage) return;

    const traces = modelIds.map((modelId, idx) => {
      const data = computeVoidageData(params, modelId);
      const label = getModelLabel(modelId, "hindered");

      return createLineTrace({
        x: data.solids,
        y: data.velocities,
        name: label,
        colorIndex: idx,
        hoverTemplate: `${label}<br>\u03C6 = %{x:.3f}<br>U = %{y:.3g} m/s<extra></extra>`,
      });
    });

    const layout = createLayout({
      xTitle: "Solid fraction \u03C6 = 1 \u2212 \u03B5 [-]",
      yTitle: "Superficial velocity U [m/s]",
      xRange: [0, 0.7],
      showLegend: modelIds.length > 1,
    });

    renderPlot(el.plots.voidage, traces, layout);
  }

  // ============================================================================
  // UI Helpers
  // ============================================================================

  /**
   * Get array of selected model IDs from checkboxes.
   * @returns {string[]} Array of selected model identifiers
   */
  function getSelectedModels() {
    const el = getElements();
    if (!el) return ["tenneti"];

    const selected = [];
    el.modelInputs.forEach((input) => {
      if (input.checked) selected.push(input.value);
    });

    return selected.length ? selected : ["tenneti"];
  }

  /**
   * Update the model note display.
   * @param {string[]} modelIds - Array of model identifiers
   */
  function updateModelNote(modelIds) {
    const el = getElements();
    if (!el?.outputs.modelNote) return;

    el.outputs.modelNote.innerHTML = modelIds
      .map((id) => getModelLabel(id, "hindered"))
      .join("<br>");
  }

  /**
   * Display results for all selected models.
   * @param {Object[]} results - Array of result objects
   */
  function displayResults(results) {
    const el = getElements();
    if (!el) return;

    const formatResult = (r, key) =>
      `${getModelLabel(r.model, "hindered")}: ${formatScientific(r[key])}`;

    el.outputs.umf.innerHTML = results.map((r) => formatResult(r, "umf")).join("<br>");
    el.outputs.slip.innerHTML = results.map((r) => formatResult(r, "slip")).join("<br>");
    el.outputs.rep.innerHTML = results.map((r) => formatResult(r, "Rep")).join("<br>");
  }

  /**
   * Display invalid input message.
   */
  function displayInvalidInput() {
    const el = getElements();
    if (!el) return;

    el.outputs.umf.textContent = "invalid input";
    el.outputs.slip.textContent = "-";
    el.outputs.rep.textContent = "-";
  }

  // ============================================================================
  // Main Update Function
  // ============================================================================

  /**
   * Main update function - reads inputs, computes results, updates display.
   */
  function update() {
    const el = getElements();
    if (!el) return;

    // Parse inputs
    const D = parseFloat(el.inputs.diameter.value);
    const rhoP = parseFloat(el.inputs.rhoP.value);
    const rhoF = parseFloat(el.inputs.rhoF.value);
    const mu = parseFloat(el.inputs.mu.value);
    const epsilon0 = parseFloat(el.inputs.epsilon0.value);

    // Validate inputs
    if (!validatePositive([D, rhoP, rhoF, mu, epsilon0]) || epsilon0 >= 1) {
      displayInvalidInput();
      return;
    }

    const modelIds = getSelectedModels();
    updateModelNote(modelIds);

    const params = { rhoP, rhoF, mu, D };

    // Compute results for each model
    const results = modelIds.map((model) => {
      const slip = solveSlipVelocity(params, epsilon0, model);
      const umf = epsilon0 * slip;
      const Rep = reynoldsNumber(rhoF, slip, D, mu);
      return { model, slip, umf, Rep };
    });

    displayResults(results);
    plotExpansion(params, epsilon0, modelIds);
    plotVoidageVelocity(params, modelIds);
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize event listeners and run initial calculation.
   */
  function init() {
    const el = getElements();
    if (!el) return;

    // Button click
    el.computeBtn?.addEventListener("click", update);

    // Input changes
    Object.values(el.inputs).forEach((input) => {
      input?.addEventListener("change", update);
    });

    // Model selection changes
    el.modelInputs.forEach((input) => {
      input.addEventListener("change", update);
    });

    // Initial calculation
    update();
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", init);
})();
