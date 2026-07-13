---
hide:
  - navigation
---

# HPC job cost calculator

[:octicons-arrow-left-24: Back to Utilities](index.md)

Estimate the allocation cost of a high-performance computing job. Enter the number of cores and the job's wall-clock duration in hours to obtain the cost expressed in **core-hours** and **core-years** (using 1 core-year = 8760 core-hours).

<div id="hpc-cost-tool" class="tool-card">
  <form id="hpc-form" class="hpc-form">
    <div class="hpc-field">
      <label for="hpc-cores">Number of cores</label>
      <input type="number" id="hpc-cores" value="128" step="1" min="1" inputmode="numeric">
    </div>

    <div class="hpc-field">
      <label for="hpc-hours">Job length (hours)</label>
      <input type="number" id="hpc-hours" value="24" step="0.5" min="0" inputmode="decimal">
    </div>
  </form>

  <div class="hpc-results">
    <div class="hpc-stat">
      <div class="hpc-value"><span id="hpc-core-hours">–</span></div>
      <div class="hpc-unit">core·hours</div>
      <div class="hpc-caption">Cost in core-hours</div>
    </div>
    <div class="hpc-stat">
      <div class="hpc-value"><span id="hpc-core-years">–</span></div>
      <div class="hpc-unit">core·years</div>
      <div class="hpc-caption">Cost in core-years</div>
    </div>
  </div>
</div>
