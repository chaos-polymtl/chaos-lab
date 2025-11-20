# Utilities

This page gathers small interactive tools for quick calculations.


## Terminal velocity calculator
<div id="drag-calculator" class="tool-card">
  <div class="tool-layout">
    <!-- Left: inputs -->
    <form id="drag-form" class="tool-form">
      <div class="field">
        <label for="diameter">Diameter D [m]</label>
        <input type="number" id="diameter" value="0.001" step="0.0001">
      </div>

      <div class="field">
        <label for="rho_p">Particle density ρ_p [kg/m³]</label>
        <input type="number" id="rho_p" value="1100" step="10">
      </div>

      <div class="field">
        <label for="rho_f">Fluid density ρ_f [kg/m³]</label>
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
