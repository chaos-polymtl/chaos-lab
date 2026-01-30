/**
 * Drag Calculator (Terminal Velocity)
 * Interactive tool for calculating terminal velocity of spherical particles.
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
    stokesTerminalVelocity,
    newtonRaphson,
    validatePositive,
  } = window.PhysicsUtils;

  const { computeSingleParticleCd, singleParticleModels, getModelLabel } =
    window.DragModels;

  const {
    logspace,
    createLayout,
    createLineTrace,
    renderPlot,
    formatScientific,
  } = window.PlotUtils;

  // ============================================================================
  // DOM Elements
  // ============================================================================

  let elements = null;

  /**
   * Get or cache DOM element references.
   * Re-resolves elements each time to handle MkDocs Material navigation.
   * @returns {Object|null} Object with element references or null if container not found
   */
  function getElements() {
    const container = document.getElementById("drag-calculator");
    if (!container) return null;

    // Re-resolve elements each time for MkDocs compatibility
    elements = {
      container,
      inputs: {
        diameter: document.getElementById("diameter"),
        rhoP: document.getElementById("rho_p"),
        rhoF: document.getElementById("rho_f"),
        mu: document.getElementById("mu"),
      },
      computeBtn: document.getElementById("compute-btn"),
      modelInputs: document.querySelectorAll('input[name="drag_model"]'),
      outputs: {
        vt: document.getElementById("vt"),
        Rep: document.getElementById("Rep"),
        Cd: document.getElementById("Cd"),
        equation: document.getElementById("cd-equation"),
      },
      plot: document.getElementById("drag-plot"),
    };

    return elements;
  }

  // ============================================================================
  // Physics Calculations
  // ============================================================================

  /**
   * Compute drag force for a given velocity and model.
   * @param {Object} params - Fluid/particle parameters
   * @param {number} velocity - Particle velocity [m/s]
   * @param {string} modelId - Drag model identifier
   * @returns {number} Drag force [N]
   */
  function computeDragForce(params, velocity, modelId) {
    const { rhoF, mu, D } = params;
    const Re = reynoldsNumber(rhoF, velocity, D, mu);
    const Cd = computeSingleParticleCd(Re, modelId);
    return dragForce(rhoF, Cd, D, velocity);
  }

  /**
   * Compute force balance (gravity - drag).
   * At terminal velocity, this should equal zero.
   * @param {Object} params - Fluid/particle parameters
   * @param {number} velocity - Particle velocity [m/s]
   * @param {string} modelId - Drag model identifier
   * @returns {number} Net force [N]
   */
  function forceBalance(params, velocity, modelId) {
    const { rhoP, rhoF, D } = params;
    const weight = particleWeight(rhoP, rhoF, D);
    const drag = computeDragForce(params, velocity, modelId);
    return weight - drag;
  }

  /**
   * Solve for terminal velocity using Newton-Raphson.
   * @param {Object} params - Fluid/particle parameters
   * @param {string} modelId - Drag model identifier
   * @returns {number} Terminal velocity [m/s]
   */
  function solveTerminalVelocity(params, modelId) {
    const { rhoP, rhoF, mu, D } = params;

    // Initial guess from Stokes' law
    const initialGuess = stokesTerminalVelocity(rhoP, rhoF, D, mu);

    // Force balance: W - F_drag = 0
    const f = (v) => forceBalance(params, v, modelId);

    return newtonRaphson(f, initialGuess, {
      dx: 1e-6,
      minValue: 1e-10,
    });
  }

  // ============================================================================
  // Plotting
  // ============================================================================

  /**
   * Initialize the Cd vs Re plot showing all drag models.
   */
  function initCdPlot() {
    const el = getElements();
    if (!el?.plot) return;

    const ReValues = logspace(-1, 4, 200);

    // Build list of models to plot
    const modelsForPlot = [
      { id: "stokes", label: "Stokes" },
      { id: "schiller-naumann", label: "Schiller-Naumann" },
      { id: "clift-gauvin", label: "Clift-Gauvin" },
      { id: "clift-grace-weber", label: "Clift-Grace-Weber" },
    ];

    const traces = modelsForPlot.map((model, idx) => {
      const Cds = ReValues.map((Re) => computeSingleParticleCd(Re, model.id));

      return createLineTrace({
        x: ReValues,
        y: Cds,
        name: model.label,
        colorIndex: idx,
      });
    });

    const layout = createLayout({
      xTitle: "Re",
      yTitle: "C\u2091", // C_D with subscript
      height: 300,
      logX: true,
      logY: true,
    });

    renderPlot(el.plot, traces, layout);
  }

  // ============================================================================
  // UI Helpers
  // ============================================================================

  /**
   * Get the currently selected drag model ID.
   * @returns {string} Selected model identifier
   */
  function getSelectedModel() {
    const el = getElements();
    if (!el) return "stokes";

    let model = "stokes";
    el.modelInputs.forEach((input) => {
      if (input.checked) model = input.value;
    });
    return model;
  }

  /**
   * Update the drag equation display for the selected model.
   * @param {string} modelId - Drag model identifier
   */
  function updateEquationDisplay(modelId) {
    const el = getElements();
    if (!el?.outputs.equation) return;

    const model = singleParticleModels[modelId];
    el.outputs.equation.innerHTML = model?.equation || "";
  }

  /**
   * Display results in the output spans.
   * @param {number} vt - Terminal velocity [m/s]
   * @param {number} Rep - Particle Reynolds number [-]
   * @param {number} Cd - Drag coefficient [-]
   */
  function displayResults(vt, Rep, Cd) {
    const el = getElements();
    if (!el) return;

    el.outputs.vt.textContent = formatScientific(vt);
    el.outputs.Rep.textContent = formatScientific(Rep);
    el.outputs.Cd.textContent = formatScientific(Cd);
  }

  /**
   * Display invalid input message.
   */
  function displayInvalidInput() {
    const el = getElements();
    if (!el) return;

    el.outputs.vt.textContent = "invalid input";
    el.outputs.Rep.textContent = "-";
    el.outputs.Cd.textContent = "-";
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

    // Check all required elements exist (handles MkDocs navigation)
    const { diameter, rhoP, rhoF, mu } = el.inputs;
    const { vt, Rep, Cd } = el.outputs;
    if (!diameter || !rhoP || !rhoF || !mu || !vt || !Rep || !Cd) {
      return;
    }

    // Parse inputs
    const D = parseFloat(diameter.value);
    const rhoP_val = parseFloat(rhoP.value);
    const rhoF_val = parseFloat(rhoF.value);
    const mu_val = parseFloat(mu.value);

    // Validate inputs
    if (!validatePositive([D, rhoP_val, rhoF_val, mu_val])) {
      displayInvalidInput();
      return;
    }

    const modelId = getSelectedModel();
    const params = { rhoP: rhoP_val, rhoF: rhoF_val, mu: mu_val, D };

    // Solve for terminal velocity
    const terminalVelocity = solveTerminalVelocity(params, modelId);
    const Re = reynoldsNumber(rhoF_val, terminalVelocity, D, mu_val);
    const dragCoeff = computeSingleParticleCd(Re, modelId);

    displayResults(terminalVelocity, Re, dragCoeff);
    updateEquationDisplay(modelId);
  }

  // ============================================================================
  // Event Handling
  // ============================================================================

  /**
   * Safely attach an event listener to an element.
   * @param {HTMLElement|null} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @returns {boolean} True if listener was attached
   */
  function on(element, event, handler) {
    if (!element) return false;
    element.addEventListener(event, handler);
    return true;
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
    on(el.computeBtn, "click", update);

    // Input changes
    Object.values(el.inputs)
      .filter(Boolean)
      .forEach((input) => on(input, "change", update));

    // Model selection changes
    Array.from(el.modelInputs || [])
      .filter(Boolean)
      .forEach((input) => on(input, "change", update));

    // Initialize plot and run first calculation
    initCdPlot();
    update();
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", init);
})();
