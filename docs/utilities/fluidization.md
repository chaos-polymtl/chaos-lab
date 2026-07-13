---
hide:
  - navigation
---

# Minimum fluidization & bed expansion

[:octicons-arrow-left-24: Back to Utilities](index.md)

Estimate the minimum fluidization velocity from hindered-drag correlations. Visualize how the bed expands with superficial gas/liquid velocity (top graph) or what is the equilibrium superficial velocity as a function of the bed voidage (bottom graph).

<div id="fluidization-tool" class="tool-card">
  <div class="tool-layout">
    <!-- Left: inputs -->
    <form id="mf-form" class="tool-form">
      <div class="field">
        <label for="mf-diameter">Particle diameter d<sub>p</sub> [m]</label>
        <input type="number" id="mf-diameter" value="0.001" step="0.0001">
      </div>

      <div class="field">
        <label for="mf-rho-p">Particle density ρ<sub>p</sub> [kg/m³]</label>
        <input type="number" id="mf-rho-p" value="1000" step="10">
      </div>

      <div class="field">
        <label for="mf-rho-f">Fluid density ρ<sub>f</sub> [kg/m³]</label>
        <input type="number" id="mf-rho-f" value="1" step="10">
      </div>

      <div class="field">
        <label for="mf-mu">Dynamic viscosity μ [Pa·s]</label>
        <input type="number" id="mf-mu" value="0.00001" step="0.0001">
      </div>

      <div class="field">
        <label for="mf-epsilon0">Packed voidage ε<sub>0</sub> [–]</label>
        <input type="number" id="mf-epsilon0" value="0.36" step="0.01" min="0.2" max="1">
      </div>

      <button type="button" id="mf-compute-btn" class="tool-button">
        Compute
      </button>
    </form>

    <!-- Right: drag model choice -->
    <div class="tool-options">
      <fieldset class="model-choice">
        <legend>Hindered drag model</legend>

        <label>
          <input type="checkbox" name="mf_drag_model" value="beetstra">
          Beetstra et al. (2007)
        </label>

        <label>
          <input type="checkbox" name="mf_drag_model" value="di-felice">
          Di Felice (1994)
        </label>

        <label>
          <input type="checkbox" name="mf_drag_model" value="tenneti" checked>
          Tenneti et al. (2011)
        </label>

        <label>
          <input type="checkbox" name="mf_drag_model" value="rong">
          Rong et al. (2015)
        </label>

        <label>
          <input type="checkbox" name="mf_drag_model" value="wen-yu">
          Wen–Yu (1966)
        </label>
      </fieldset>

    <div id="mf-model-note" class="model-note">
      Beetstra et al. (2007)
    </div>
    </div>
  </div>

  <!-- Results below -->
  <div class="tool-results tool-results-below">
    <div class="result-line">
      <span class="result-label">Minimum fluidization velocity U<sub>mf</sub></span>
      <span class="result-value"><span id="mf-umf">–</span> m/s</span>
    </div>
    <div class="result-line">
      <span class="result-label">Slip velocity at U<sub>mf</sub></span>
      <span class="result-value"><span id="mf-slip">–</span> m/s</span>
    </div>
    <div class="result-line">
      <span class="result-label">Particle Re at U<sub>mf</sub></span>
      <span class="result-value"><span id="mf-rep">–</span></span>
    </div>
  </div>

<div id="mf-plot" style="margin-top:1rem;"></div>
<div id="mf-voidage-plot" style="margin-top:1rem;"></div>
</div>
