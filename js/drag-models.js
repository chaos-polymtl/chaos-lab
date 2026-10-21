/**
 * Drag Models Registry for Particle Dynamics Calculators
 * Contains single-particle and hindered (packed bed) drag correlations.
 */
(function (global) {
  "use strict";

  const { safeValue, DEFAULT_TOLERANCE } = global.PhysicsUtils;

  // ============================================================================
  // Base Drag Coefficient (Schiller-Naumann style)
  // ============================================================================

  /**
   * Standard base drag coefficient (Schiller-Naumann form).
   * Used as building block for hindered correlations.
   * @param {number} Re - Particle Reynolds number
   * @returns {number} Drag coefficient
   */
  function baseDragCoefficient(Re) {
    if (Re <= 0) return 0.0;
    if (Re < 1000) {
      return (24.0 / Re) * (1.0 + 0.15 * Math.pow(Re, 0.687));
    }
    return 0.44;
  }

  // ============================================================================
  // Single-Particle Drag Models (for terminal velocity)
  // ============================================================================

  const singleParticleModels = {
    stokes: {
      id: "stokes",
      label: "Stokes",
      equation:
        'C<sub>D</sub> = 24 / Re<sub>p</sub>' +
        '<br><span style="opacity:0.75">(Stokes)</span>',
      compute(Re) {
        if (Re <= 0) return 0.0;
        return 24.0 / Re;
      },
    },

    "schiller-naumann": {
      id: "schiller-naumann",
      label: "Schiller-Naumann (1933)",
      equation:
        'C<sub>D</sub> = 24 / Re<sub>p</sub> ' +
        '(1 + 0.15 Re<sub>p</sub><sup>0.687</sup>)' +
        '<br><span style="opacity:0.75">(Schiller-Naumann)</span>',
      compute(Re) {
        if (Re <= 0) return 0.0;
        if (Re < 1000) {
          return (24.0 / Re) * (1.0 + 0.15 * Math.pow(Re, 0.687));
        }
        return 0.44;
      },
    },

    "clift-gauvin": {
      id: "clift-gauvin",
      label: "Clift-Gauvin (1970)",
      equation:
        'C<sub>D</sub> = 24 / Re<sub>p</sub> ' +
        '(1 + 0.15 Re<sub>p</sub><sup>0.687</sup>) + ' +
        '0.42 / (1 + 42500 Re<sub>p</sub><sup>-1.16</sup>)' +
        '<br><span style="opacity:0.75">(Clift-Gauvin)</span>',
      compute(Re) {
        if (Re <= 0) return 0.0;
        const term1 = (24.0 / Re) * (1.0 + 0.15 * Math.pow(Re, 0.687));
        const term2 = 0.42 / (1.0 + 42500.0 * Math.pow(Re, -1.16));
        return term1 + term2;
      },
    },

    "clift-grace-weber": {
      id: "clift-grace-weber",
      label: "Clift-Grace-Weber (2005)",
      equation:
        '<span style="font-size:0.8em">' +
        "C<sub>D</sub> = " +
        "<br>&nbsp;&nbsp;24 / Re<sub>p</sub> [1 + 0.1315 Re<sub>p</sub>" +
        "<sup>0.82 - 0.05&nbsp;log<sub>10</sub>Re<sub>p</sub></sup>], " +
        "if Re<sub>p</sub> &#8804; 20," +
        "<br>&nbsp;&nbsp;24 / Re<sub>p</sub> [1 + 0.1935 Re<sub>p</sub>" +
        "<sup>0.6305</sup>], if Re<sub>p</sub> &#8805; 20" +
        "</span>" +
        '<span style="opacity:0.75"> <br>&nbsp;&nbsp; (Clift-Grace-Weber)</span>',
      compute(Re) {
        if (Re <= 0) return 0.0;
        if (Re <= 20.0) {
          return (
            (24.0 / Re) *
            (1.0 + 0.1315 * Math.pow(Re, 0.82 - 0.05 * Math.log10(Re)))
          );
        }
        return (24.0 / Re) * (1.0 + 0.1935 * Math.pow(Re, 0.6305));
      },
    },
  };

  // ============================================================================
  // Hindered Drag Models (for fluidization / packed beds)
  // ============================================================================

  /**
   * Di Felice chi exponent for voidage correction.
   * @param {number} Re - Particle Reynolds number
   * @returns {number} Chi exponent
   */
  function diFeliceChi(Re) {
    const safeRe = safeValue(Re);
    const term = 1.5 - Math.log10(safeRe);
    return 3.7 - 0.65 * Math.exp(-(term * term) / 2.0);
  }

  const hinderedModels = {
    beetstra: {
      id: "beetstra",
      label: "Beetstra (2007)",
      compute(Re, epsilon) {
        // Beetstra et al. (2007): viscous + inertial decomposition
        const safeRe = safeValue(Re);
        const eps = safeValue(epsilon, 1e-4);
        const viscous =
          ((24.0 / safeRe) * (1.0 + 0.15 * Math.pow(safeRe, 0.687))) /
          (eps * eps);
        const inertial = (0.44 * (1.0 - eps)) / Math.pow(eps, 3.0);
        return viscous + inertial;
      },
    },

    "di-felice": {
      id: "di-felice",
      label: "Di Felice (1994)",
      compute(Re, epsilon) {
        const chi = diFeliceChi(Re);
        const eps = safeValue(epsilon, 1e-4);
        return baseDragCoefficient(Re) * Math.pow(eps, 2.0 - chi);
      },
    },

    tenneti: {
      id: "tenneti",
      label: "Tenneti (2011)",
      compute(Re, epsilon) {
        // Tenneti et al. (2011): power-law hindrance + inertial lift
        const eps = safeValue(epsilon, 1e-6);
        const hindrance = Math.pow(eps, -2.65);
        const inertial = (0.5 * (1.0 - eps)) / eps;
        return baseDragCoefficient(Re) * hindrance + inertial;
      },
    },

    rong: {
      id: "rong",
      label: "Rong (2015)",
      compute(Re, epsilon) {
        // Rong et al.: viscous scaling ~ eps^-2.2, stronger inertial crowding
        const safeRe = safeValue(Re);
        const eps = safeValue(epsilon, 1e-4);
        const viscous =
          ((24.0 / safeRe) * (1.0 + 0.15 * Math.pow(safeRe, 0.687))) /
          Math.pow(eps, 2.2);
        const inertial = (0.45 * (1.0 - eps)) / Math.pow(eps, 3.0);
        return viscous + inertial;
      },
    },

    "wen-yu": {
      id: "wen-yu",
      label: "Wen-Yu (1966)",
      compute(Re, epsilon) {
        // Wen-Yu (1966): single-sphere drag with eps scaling
        const safeRe = safeValue(Re);
        const eps = safeValue(epsilon, 1e-4);
        return (
          ((24.0 / safeRe) * (1.0 + 0.15 * Math.pow(safeRe, 0.687))) /
          (eps * eps)
        );
      },
    },
  };

  // ============================================================================
  // API Functions
  // ============================================================================

  /**
   * Get a single-particle drag model by ID.
   * @param {string} modelId - Model identifier
   * @returns {Object|null} Model object or null if not found
   */
  function getSingleParticleModel(modelId) {
    return singleParticleModels[modelId] || null;
  }

  /**
   * Get a hindered drag model by ID.
   * @param {string} modelId - Model identifier
   * @returns {Object|null} Model object or null if not found
   */
  function getHinderedModel(modelId) {
    return hinderedModels[modelId] || null;
  }

  /**
   * Compute single-particle drag coefficient.
   * @param {number} Re - Reynolds number
   * @param {string} modelId - Model identifier
   * @returns {number} Drag coefficient
   */
  function computeSingleParticleCd(Re, modelId) {
    const model = singleParticleModels[modelId];
    return model ? model.compute(Re) : baseDragCoefficient(Re);
  }

  /**
   * Compute hindered drag coefficient.
   * @param {number} Re - Reynolds number
   * @param {number} epsilon - Voidage (void fraction)
   * @param {string} modelId - Model identifier
   * @returns {number} Drag coefficient
   */
  function computeHinderedCd(Re, epsilon, modelId) {
    const eps = Math.min(Math.max(epsilon, 1e-4), 0.99);
    const model = hinderedModels[modelId];
    return model ? model.compute(Re, eps) : baseDragCoefficient(Re);
  }

  /**
   * Get all single-particle model IDs.
   * @returns {string[]} Array of model IDs
   */
  function getSingleParticleModelIds() {
    return Object.keys(singleParticleModels);
  }

  /**
   * Get all hindered model IDs.
   * @returns {string[]} Array of model IDs
   */
  function getHinderedModelIds() {
    return Object.keys(hinderedModels);
  }

  /**
   * Get model label for display.
   * @param {string} modelId - Model identifier
   * @param {string} [type='hindered'] - 'single' or 'hindered'
   * @returns {string} Human-readable label
   */
  function getModelLabel(modelId, type = "hindered") {
    const models = type === "single" ? singleParticleModels : hinderedModels;
    const model = models[modelId];
    return model ? model.label : modelId;
  }

  // ============================================================================
  // Export to global namespace
  // ============================================================================

  global.DragModels = {
    // Core functions
    baseDragCoefficient,
    diFeliceChi,

    // Model registries
    singleParticleModels,
    hinderedModels,

    // API
    getSingleParticleModel,
    getHinderedModel,
    computeSingleParticleCd,
    computeHinderedCd,
    getSingleParticleModelIds,
    getHinderedModelIds,
    getModelLabel,
  };
})(window);
