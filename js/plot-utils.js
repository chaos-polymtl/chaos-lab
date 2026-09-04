/**
 * Plot Utilities for Particle Dynamics Calculators
 * Shared Plotly configuration and helper functions.
 */
(function (global) {
  "use strict";

  // ============================================================================
  // Color Palette
  // ============================================================================

  // ColorBrewer Dark2 palette - good for accessibility
  const COLOR_PALETTE = [
    "#1b9e77", // teal
    "#d95f02", // orange
    "#7570b3", // purple
    "#e7298a", // pink
    "#66a61e", // green
    "#e6ab02", // yellow
  ];

  /**
   * Get a color from the palette by index (wraps around).
   * @param {number} index - Color index
   * @returns {string} Hex color code
   */
  function getColor(index) {
    return COLOR_PALETTE[index % COLOR_PALETTE.length];
  }

  // ============================================================================
  // Array Utilities
  // ============================================================================

  /**
   * Generate an array of logarithmically spaced values.
   * @param {number} minExp - Minimum exponent (10^minExp)
   * @param {number} maxExp - Maximum exponent (10^maxExp)
   * @param {number} n - Number of points
   * @returns {number[]} Array of logarithmically spaced values
   */
  function logspace(minExp, maxExp, n) {
    const result = [];
    const step = (maxExp - minExp) / (n - 1);
    for (let i = 0; i < n; i++) {
      result.push(Math.pow(10, minExp + step * i));
    }
    return result;
  }

  /**
   * Generate an array of linearly spaced values.
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {number} n - Number of points
   * @returns {number[]} Array of linearly spaced values
   */
  function linspace(min, max, n) {
    const result = [];
    const step = (max - min) / (n - 1);
    for (let i = 0; i < n; i++) {
      result.push(min + step * i);
    }
    return result;
  }

  // ============================================================================
  // Layout Presets
  // ============================================================================

  /**
   * Create a standard layout configuration for Plotly.
   * @param {Object} options - Layout options
   * @param {string} [options.xTitle] - X-axis title
   * @param {string} [options.yTitle] - Y-axis title
   * @param {number} [options.height=320] - Plot height in pixels
   * @param {boolean} [options.showLegend=true] - Show legend
   * @param {boolean} [options.logX=false] - Use log scale for X axis
   * @param {boolean} [options.logY=false] - Use log scale for Y axis
   * @param {number[]} [options.xRange] - X-axis range [min, max]
   * @param {number[]} [options.yRange] - Y-axis range [min, max]
   * @returns {Object} Plotly layout configuration
   */
  function createLayout(options = {}) {
    const layout = {
      margin: { t: 10, r: 10, b: 60, l: 60 },
      height: options.height || 320,
      font: { size: 14 },
      showlegend: options.showLegend !== false,
      xaxis: {},
      yaxis: {},
    };

    if (options.xTitle) {
      layout.xaxis.title = { text: options.xTitle, standoff: 10 };
    }
    if (options.yTitle) {
      layout.yaxis.title = { text: options.yTitle, standoff: 10 };
    }
    if (options.logX) {
      layout.xaxis.type = "log";
    }
    if (options.logY) {
      layout.yaxis.type = "log";
    }
    if (options.xRange) {
      layout.xaxis.range = options.xRange;
    }
    if (options.yRange) {
      layout.yaxis.range = options.yRange;
    }

    return layout;
  }

  // ============================================================================
  // Trace Builders
  // ============================================================================

  /**
   * Create a line trace for Plotly.
   * @param {Object} options - Trace options
   * @param {number[]} options.x - X values
   * @param {number[]} options.y - Y values
   * @param {string} options.name - Trace name (for legend)
   * @param {number} [options.colorIndex=0] - Index into color palette
   * @param {string} [options.color] - Override color (hex)
   * @param {number} [options.width=3] - Line width
   * @param {string} [options.hoverTemplate] - Custom hover template
   * @returns {Object} Plotly trace configuration
   */
  function createLineTrace(options) {
    const trace = {
      x: options.x,
      y: options.y,
      mode: "lines",
      name: options.name,
      line: {
        color: options.color || getColor(options.colorIndex || 0),
        width: options.width || 3,
      },
    };

    if (options.hoverTemplate) {
      trace.hovertemplate = options.hoverTemplate;
    }

    return trace;
  }

  // ============================================================================
  // Plot Helpers
  // ============================================================================

  /**
   * Check if Plotly is available.
   * @returns {boolean} True if Plotly is loaded
   */
  function isPlotlyAvailable() {
    return typeof Plotly !== "undefined";
  }

  /**
   * Safely render a Plotly plot.
   * @param {HTMLElement|string} container - Container element or ID
   * @param {Object[]} traces - Array of trace configurations
   * @param {Object} layout - Layout configuration
   * @param {Object} [config] - Plotly config options
   * @returns {boolean} True if plot was rendered
   */
  function renderPlot(container, traces, layout, config = { responsive: true }) {
    if (!isPlotlyAvailable()) {
      console.warn("Plotly is not available");
      return false;
    }

    const element =
      typeof container === "string"
        ? document.getElementById(container)
        : container;

    if (!element) {
      console.warn("Plot container not found");
      return false;
    }

    Plotly.newPlot(element, traces, layout, config);
    return true;
  }

  // ============================================================================
  // Formatting Utilities
  // ============================================================================

  /**
   * Format a number in scientific notation.
   * @param {number} value - Value to format
   * @param {number} [digits=3] - Number of significant digits
   * @returns {string} Formatted string
   */
  function formatScientific(value, digits = 3) {
    if (!Number.isFinite(value)) return "-";
    return value.toExponential(digits);
  }

  /**
   * Format a number with fixed decimal places.
   * @param {number} value - Value to format
   * @param {number} [decimals=3] - Number of decimal places
   * @returns {string} Formatted string
   */
  function formatFixed(value, decimals = 3) {
    if (!Number.isFinite(value)) return "-";
    return value.toFixed(decimals);
  }

  // ============================================================================
  // Export to global namespace
  // ============================================================================

  global.PlotUtils = {
    // Colors
    COLOR_PALETTE,
    getColor,

    // Arrays
    logspace,
    linspace,

    // Layout
    createLayout,

    // Traces
    createLineTrace,

    // Helpers
    isPlotlyAvailable,
    renderPlot,

    // Formatting
    formatScientific,
    formatFixed,
  };
})(window);
