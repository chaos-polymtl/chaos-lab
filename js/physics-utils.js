/**
 * Physics Utilities for Particle Dynamics Calculators
 * Shared module providing constants, solvers, and physics calculations.
 */
(function (global) {
  "use strict";

  // ============================================================================
  // Constants
  // ============================================================================

  const GRAVITY = 9.81; // m/s^2
  const DEFAULT_TOLERANCE = 1e-12;
  const SOLVER_MAX_ITERATIONS = 1000;
  const SOLVER_CONVERGENCE_TOL = 1e-8;

  // ============================================================================
  // Core Physics Functions
  // ============================================================================

  /**
   * Calculate the volume of a sphere.
   * @param {number} diameter - Particle diameter [m]
   * @returns {number} Volume [m^3]
   */
  function sphereVolume(diameter) {
    return (Math.PI * Math.pow(diameter, 3)) / 6.0;
  }

  /**
   * Calculate the cross-sectional area of a sphere.
   * @param {number} diameter - Particle diameter [m]
   * @returns {number} Cross-sectional area [m^2]
   */
  function sphereCrossSection(diameter) {
    return (Math.PI * diameter * diameter) / 4.0;
  }

  /**
   * Calculate the particle Reynolds number.
   * @param {number} rhoF - Fluid density [kg/m^3]
   * @param {number} velocity - Relative velocity [m/s]
   * @param {number} diameter - Particle diameter [m]
   * @param {number} mu - Dynamic viscosity [Pa.s]
   * @returns {number} Reynolds number [-]
   */
  function reynoldsNumber(rhoF, velocity, diameter, mu) {
    return (rhoF * velocity * diameter) / mu;
  }

  /**
   * Calculate the net gravitational force (weight minus buoyancy) on a particle.
   * @param {number} rhoP - Particle density [kg/m^3]
   * @param {number} rhoF - Fluid density [kg/m^3]
   * @param {number} diameter - Particle diameter [m]
   * @returns {number} Net gravitational force [N]
   */
  function particleWeight(rhoP, rhoF, diameter) {
    const volume = sphereVolume(diameter);
    return (rhoP - rhoF) * GRAVITY * volume;
  }

  /**
   * Calculate the drag force on a particle.
   * @param {number} rhoF - Fluid density [kg/m^3]
   * @param {number} Cd - Drag coefficient [-]
   * @param {number} diameter - Particle diameter [m]
   * @param {number} velocity - Relative velocity [m/s]
   * @returns {number} Drag force [N]
   */
  function dragForce(rhoF, Cd, diameter, velocity) {
    const area = sphereCrossSection(diameter);
    return 0.5 * rhoF * Cd * area * velocity * velocity;
  }

  /**
   * Estimate initial terminal velocity using Stokes' law.
   * @param {number} rhoP - Particle density [kg/m^3]
   * @param {number} rhoF - Fluid density [kg/m^3]
   * @param {number} diameter - Particle diameter [m]
   * @param {number} mu - Dynamic viscosity [Pa.s]
   * @returns {number} Estimated terminal velocity [m/s]
   */
  function stokesTerminalVelocity(rhoP, rhoF, diameter, mu) {
    return ((rhoP - rhoF) * GRAVITY * diameter * diameter) / (18.0 * mu);
  }

  // ============================================================================
  // Newton-Raphson Solver
  // ============================================================================

  /**
   * Solve for a root using the Newton-Raphson method.
   * @param {Function} f - Function to find root of: f(x) = 0
   * @param {number} x0 - Initial guess
   * @param {Object} [options] - Solver options
   * @param {number} [options.maxIter=1000] - Maximum iterations
   * @param {number} [options.tol=1e-8] - Convergence tolerance (relative)
   * @param {number} [options.dx=1e-6] - Finite difference step (relative)
   * @param {number} [options.maxStep=0.1] - Maximum relative step size
   * @param {number} [options.minValue=1e-10] - Minimum allowed value
   * @returns {number} Root of the function
   */
  function newtonRaphson(f, x0, options = {}) {
    const maxIter = options.maxIter || SOLVER_MAX_ITERATIONS;
    const tol = options.tol || SOLVER_CONVERGENCE_TOL;
    const dxRel = options.dx || 1e-6;
    const maxStepRel = options.maxStep || 0.1;
    const minValue = options.minValue || 1e-10;

    let x = Math.max(x0, minValue);

    for (let i = 0; i < maxIter; i++) {
      const fx = f(x);
      const dx = Math.max(x * dxRel, DEFAULT_TOLERANCE);
      const fxPlusDx = f(x + dx);
      const jacobian = (fxPlusDx - fx) / dx;

      let delta = -fx / jacobian;

      // Limit step size to avoid divergence
      if (Math.abs(delta / x) > maxStepRel) {
        delta = maxStepRel * delta;
      }

      x += delta;

      // Ensure x stays positive and finite
      if (x <= 0 || !Number.isFinite(x)) {
        x = Math.max(Math.abs(delta), minValue);
      }

      // Check convergence
      if (Math.abs(delta) / x < tol) {
        break;
      }
    }

    return x;
  }

  // ============================================================================
  // Input Validation
  // ============================================================================

  /**
   * Validate that all values are finite positive numbers.
   * @param {number[]} values - Array of values to validate
   * @returns {boolean} True if all values are valid
   */
  function validatePositive(values) {
    return values.every((v) => Number.isFinite(v) && v > 0);
  }

  /**
   * Clamp a value between min and max.
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Ensure a value is at least a minimum (for numerical stability).
   * @param {number} value - Value to check
   * @param {number} [min=1e-12] - Minimum value
   * @returns {number} Value or minimum
   */
  function safeValue(value, min = DEFAULT_TOLERANCE) {
    return Math.max(value, min);
  }

  // ============================================================================
  // Export to global namespace
  // ============================================================================

  global.PhysicsUtils = {
    // Constants
    GRAVITY,
    DEFAULT_TOLERANCE,
    SOLVER_MAX_ITERATIONS,
    SOLVER_CONVERGENCE_TOL,

    // Physics functions
    sphereVolume,
    sphereCrossSection,
    reynoldsNumber,
    particleWeight,
    dragForce,
    stokesTerminalVelocity,

    // Solver
    newtonRaphson,

    // Validation
    validatePositive,
    clamp,
    safeValue,
  };
})(window);
