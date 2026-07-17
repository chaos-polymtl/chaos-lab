---
hide:
  - navigation
---

# Stokes number calculator

[:octicons-arrow-left-24: Back to Utilities](index.md)

The **Stokes number** compares a particle's inertial response time to a
characteristic time of the surrounding flow. It is defined as

**St = τ<sub>p</sub> / τ<sub>f</sub>**, with the particle relaxation time
(Stokes-drag regime) **τ<sub>p</sub> = ρ<sub>p</sub> d<sub>p</sub>² / (18 μ)**
and the flow time scale **τ<sub>f</sub> = L<sub>c</sub> / U**, built from a
characteristic length L<sub>c</sub> and velocity U.

<div id="stokes-tool" class="tool-card stat-tool">
  <form id="stokes-form" class="calc-form">
    <div class="calc-field">
      <label for="stokes-diameter"><span class="calc-name">Particle diameter</span><span class="calc-sym">d<sub>p</sub> [m]</span></label>
      <input type="number" id="stokes-diameter" value="5e-5" step="1e-6" min="0">
    </div>

    <div class="calc-field">
      <label for="stokes-density"><span class="calc-name">Particle density</span><span class="calc-sym">ρ<sub>p</sub> [kg/m³]</span></label>
      <input type="number" id="stokes-density" value="1000" step="10" min="0">
    </div>

    <div class="calc-field">
      <label for="stokes-viscosity"><span class="calc-name">Dynamic viscosity</span><span class="calc-sym">μ [Pa·s]</span></label>
      <input type="number" id="stokes-viscosity" value="1.8e-5" step="1e-6" min="0">
    </div>

    <div class="calc-field">
      <label for="stokes-velocity"><span class="calc-name">Characteristic velocity</span><span class="calc-sym">U [m/s]</span></label>
      <input type="number" id="stokes-velocity" value="1" step="0.1" min="0">
    </div>

    <div class="calc-field">
      <label for="stokes-length"><span class="calc-name">Characteristic length</span><span class="calc-sym">L<sub>c</sub> [m]</span></label>
      <input type="number" id="stokes-length" value="0.01" step="0.001" min="0">
    </div>
  </form>

  <div class="calc-results">
    <div class="calc-stat">
      <div class="calc-value"><span id="stokes-taup">–</span></div>
      <div class="calc-unit">s</div>
      <div class="calc-caption">Particle relaxation time τ<sub>p</sub></div>
    </div>
    <div class="calc-stat">
      <div class="calc-value"><span id="stokes-tauf">–</span></div>
      <div class="calc-unit">s</div>
      <div class="calc-caption">Flow time scale τ<sub>f</sub></div>
    </div>
    <div class="calc-stat">
      <div class="calc-value"><span id="stokes-number">–</span></div>
      <div class="calc-unit">–</div>
      <div class="calc-caption">Stokes number St</div>
    </div>
  </div>
</div>
