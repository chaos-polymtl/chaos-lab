# Utilities

This page gathers small interactive tools for quick calculations.


## Terminal velocity calculator

This utility calculates the terminal velocity, Reynolds number and drag coefficient of a spherical particle. The forces accounted for are drag, buoyancy and gravity. Various drag models are available.

<div id="drag-calculator" class="tool-card">
  <div class="tool-layout">
    <!-- Left: inputs -->
    <form id="drag-form" class="tool-form">
      <div class="field">
        <label for="diameter">Diameter d<sub>p</sub> [m]</label>
        <input type="number" id="diameter" value="0.001" step="0.0001">
      </div>

      <div class="field">
        <label for="rho_p">Particle density ρ<sub>p</sub> [kg/m³]</label>
        <input type="number" id="rho_p" value="1100" step="10">
      </div>

      <div class="field">
        <label for="rho_f">Fluid density ρ<sub>f</sub> [kg/m³]</label>
        <input type="number" id="rho_f" value="1000" step="10">
      </div>

      <div class="field">
        <label for="mu">Dynamic viscosity μ [Pa·s]</label>
        <input type="number" id="mu" value="0.001" step="0.0001">
      </div>

      <button type="button" id="compute-btn" class="tool-button">
        Compute
      </button>
    </form>

    <!-- Right: drag model choice -->
    <div class="tool-options">
      <fieldset class="model-choice">
        <legend>Drag model</legend>

        <label>
          <input type="radio" name="drag_model" value="stokes" checked>
          Stokes
        </label>

        <label>
          <input type="radio" name="drag_model" value="schiller-naumann">
          Schiller–Naumann (1933)
        </label>

        <label>
          <input type="radio" name="drag_model" value="clift-gauvin">
          Clift–Gauvin (1970)
        </label>
        
        <label>
          <input type="radio" name="drag_model" value="clift-grace-weber">
          Clift–Grace–Weber (2005)
        </label>
      </fieldset>

    <div id="cd-equation" class="model-note">
      C<sub>D</sub> = 24 / Re<sub>p</sub>  (Stokes)
    </div>
    </div>
  </div>

  <!-- Results below -->
  <div id="results" class="tool-results tool-results-below">
    <div class="result-line">
      <span class="result-label">Terminal Velocity</span>
      <span class="result-value"><span id="vt">–</span> m/s</span>
    </div>
    <div class="result-line">
      <span class="result-label">Particle Reynolds Number</span>
      <span class="result-value"><span id="Rep">–</span> </span>
    </div>
    <div class="result-line">
      <span class="result-label">Drag Coefficient</span>
      <span class="result-value"><span id="Cd">–</span> </span>
    </div>
  </div>

<div id="drag-plot" style="margin-top:1rem;"></div>

<script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
</div>


## Minimum fluidization & bed expansion

Estimate the minimum fluidization velocity from hindered-drag correlations and visualize how the bed expands with superficial gas/liquid velocity.

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
        <input type="number" id="mf-epsilon0" value="0.60" step="0.01" min="0.2" max="1">
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
          <input type="checkbox" name="mf_drag_model" value="ergun">
          Ergun (1952)
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
