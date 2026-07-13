---
hide:
  - navigation
---

# DEM Rayleigh time & contact overlap

[:octicons-arrow-left-24: Back to Utilities](index.md)

For a spherical particle, this tool computes the **Rayleigh critical time** — commonly used to
select a stable Discrete Element Method (DEM) time step — from the particle diameter, density,
Young's modulus and Poisson's ratio. Given a typical **impact velocity**, it also estimates the
**maximum Hertzian contact overlap** during a collision between two identical particles, in
metres and as a percentage of the particle diameter.

<div id="dem-contact-tool" class="tool-card stat-tool">
  <form id="dem-form" class="calc-form">
    <div class="calc-field">
      <label for="dem-diameter"><span class="calc-name">Particle diameter</span><span class="calc-sym">d<sub>p</sub> [m]</span></label>
      <input type="number" id="dem-diameter" value="0.001" step="0.0001" min="0">
    </div>

    <div class="calc-field">
      <label for="dem-density"><span class="calc-name">Particle density</span><span class="calc-sym">ρ<sub>p</sub> [kg/m³]</span></label>
      <input type="number" id="dem-density" value="2500" step="10" min="0">
    </div>

    <div class="calc-field">
      <label for="dem-young"><span class="calc-name">Young's modulus</span><span class="calc-sym">E [Pa]</span></label>
      <input type="number" id="dem-young" value="1e7" step="1e6" min="0">
    </div>

    <div class="calc-field">
      <label for="dem-poisson"><span class="calc-name">Poisson ratio</span><span class="calc-sym">ν [–]</span></label>
      <input type="number" id="dem-poisson" value="0.3" step="0.01" min="0" max="0.5">
    </div>

    <div class="calc-field">
      <label for="dem-velocity"><span class="calc-name">Impact velocity</span><span class="calc-sym">v [m/s]</span></label>
      <input type="number" id="dem-velocity" value="1" step="0.1" min="0">
    </div>
  </form>

  <div class="calc-results">
    <div class="calc-stat">
      <div class="calc-value"><span id="dem-rayleigh">–</span></div>
      <div class="calc-unit">s</div>
      <div class="calc-caption">Rayleigh critical time</div>
    </div>
    <div class="calc-stat">
      <div class="calc-value"><span id="dem-overlap">–</span></div>
      <div class="calc-unit">m</div>
      <div class="calc-caption">Max contact overlap</div>
    </div>
    <div class="calc-stat">
      <div class="calc-value"><span id="dem-overlap-pct">–</span></div>
      <div class="calc-unit">% of diameter</div>
      <div class="calc-caption">Overlap / diameter</div>
    </div>
  </div>
</div>
