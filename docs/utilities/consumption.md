# Consumption calculator

[Back to Utilities](../)

This utility reads cumulative user consumption from a CSV file and displays the total consumption, the number of users
with non-zero usage, each user's share of the total, and a pie chart. The CSV values can be specified as either
**core-days** or **core-years**, but all displayed values are converted to and shown as **core-years**.

<div class="consumption-calculator">
  <div class="cc-wrap">
    <p class="eyebrow">Usage utilities</p>
    <h1>Consumption calculator</h1>
    <p class="lede">Upload a CSV where the first column is a date and each remaining column is one user's <strong>cumulative</strong> consumption. First select the unit used by the CSV. All results are displayed in <strong>core-years</strong>.</p>

    <div class="card">
      <h2>1. Upload data</h2>
      <p class="sub">.csv, first column = date, one column per user</p>

      <div class="field-row unit-row">
        <div class="field">
          <label for="unit-select">CSV consumption unit</label>
          <select id="unit-select">
            <option value="core-days">Core-days</option>
            <option value="core-years">Core-years</option>
          </select>
          <div class="field-help">Choose the unit used by the values in your CSV. Results are always displayed in core-years.</div>
        </div>
      </div>

      <div id="dropzone">
        <div class="icon">↑</div>
        <div class="main-txt">Drop a CSV here, or click to browse</div>
        <div class="sub-txt">Only your browser reads this file — nothing is uploaded anywhere</div>
        <input type="file" id="file-input" accept=".csv,text/csv">
      </div>
      <div id="filename-tag"><span id="filename-text"></span><button id="clear-file">clear</button></div>

      <div class="field-row" id="row-select-row" style="display:none;">
        <div class="field">
          <label for="row-select">Reporting date</label>
          <select id="row-select"></select>
        </div>
      </div>

      <div id="error-msg"></div>
    </div>

    <div id="results-section">
      <div class="card">
        <h2>2. Consumption so far</h2>
        <p class="sub" id="results-sub"></p>

        <div class="totals-strip">
          <div class="stat"><div class="num" id="stat-total">–</div><div class="lbl">Total, all users (core-years)</div></div>
          <div class="stat"><div class="num" id="stat-users">–</div><div class="lbl">Users with usage</div></div>
          <div class="stat"><div class="num" id="stat-top">–</div><div class="lbl">Largest share</div></div>
        </div>
      </div>

      <div class="card">
        <div class="split">
          <div id="pie-plot"></div>
          <table id="data-table">
            <caption>Per-user breakdown</caption>
            <thead>
              <tr><th>User</th><th class="num">Total (core-years)</th><th class="num">Share</th></tr>
            </thead>
            <tbody id="table-body"></tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h2>3. Total consumption over time</h2>
        <p class="sub" id="total-plot-sub">Sum across all users, for every reporting date in the file</p>
        <div id="total-plot"></div>
      </div>
    </div>

    <footer id="results-footer">Values are converted from the selected CSV unit and always displayed in core-years.</footer>

  </div>
</div>

<style>
.consumption-calculator {
  --cc-bg: #F5F7F8;
  --cc-card: #FFFFFF;
  --cc-ink: #10233F;
  --cc-ink-soft: #4B5B70;
  --cc-line: #DCE3E8;
  --cc-accent: #146B69;
  --cc-accent-soft: #E4F0EF;
  --cc-mono: 'IBM Plex Mono', ui-monospace, monospace;
  --cc-disp: 'Space Grotesk', sans-serif;
  --cc-body: 'Inter', sans-serif;
  color: var(--cc-ink);
  font-family: var(--cc-body);
  background: var(--cc-bg);
  padding: 32px 20px 50px;
  border-radius: 10px;
}

.consumption-calculator .cc-wrap {
  max-width: 960px;
  margin: 0 auto;
}

.consumption-calculator .eyebrow {
  font-family: var(--cc-mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cc-accent);
  margin: 0 0 6px;
}

.consumption-calculator h1 {
  font-family: var(--cc-disp);
  font-weight: 700;
  font-size: 30px;
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}

.consumption-calculator .lede {
  color: var(--cc-ink-soft);
  font-size: 14.5px;
  line-height: 1.55;
  max-width: 62ch;
  margin: 0 0 28px;
}

.consumption-calculator .card {
  background: var(--cc-card);
  border: 1px solid var(--cc-line);
  border-radius: 10px;
  padding: 22px 24px;
  margin-bottom: 22px;
}

.consumption-calculator .card h2 {
  font-family: var(--cc-disp);
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
}

.consumption-calculator .card .sub {
  color: var(--cc-ink-soft);
  font-size: 13px;
  margin: 0 0 16px;
}

.consumption-calculator .field-row {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.consumption-calculator .unit-row {
  margin-top: 0;
  margin-bottom: 16px;
}

.consumption-calculator .field {
  flex: 1;
  min-width: 180px;
}

.consumption-calculator .field label {
  display: block;
  font-size: 12px;
  color: var(--cc-ink-soft);
  margin-bottom: 6px;
  font-family: var(--cc-mono);
}

.consumption-calculator .field select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--cc-line);
  font-family: var(--cc-body);
  font-size: 13.5px;
  background: #fff;
  color: var(--cc-ink);
}

.consumption-calculator .field-help {
  color: var(--cc-ink-soft);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 6px;
}

.consumption-calculator #dropzone {
  border: 1.5px dashed var(--cc-line);
  border-radius: 8px;
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease;
}

.consumption-calculator #dropzone:hover,
.consumption-calculator #dropzone.drag {
  border-color: var(--cc-accent);
  background: var(--cc-accent-soft);
}

.consumption-calculator #dropzone .icon {
  font-family: var(--cc-mono);
  font-size: 20px;
  color: var(--cc-accent);
  margin-bottom: 8px;
}

.consumption-calculator #dropzone .main-txt {
  font-size: 14px;
  font-weight: 500;
}

.consumption-calculator #dropzone .sub-txt {
  font-size: 12.5px;
  color: var(--cc-ink-soft);
  margin-top: 4px;
}

.consumption-calculator #file-input {
  display: none;
}

.consumption-calculator #filename-tag {
  display: none;
  margin-top: 14px;
  font-family: var(--cc-mono);
  font-size: 12.5px;
  background: var(--cc-accent-soft);
  color: var(--cc-accent);
  border-radius: 6px;
  padding: 6px 10px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.consumption-calculator #filename-tag button {
  border: none;
  background: none;
  color: var(--cc-accent);
  cursor: pointer;
  font-family: var(--cc-mono);
  font-size: 12px;
  text-decoration: underline;
}

.consumption-calculator #error-msg {
  display: none;
  color: #B4472B;
  font-size: 13px;
  margin-top: 14px;
  font-family: var(--cc-mono);
}

.consumption-calculator #results-section {
  display: none;
}

.consumption-calculator .totals-strip {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.consumption-calculator .stat {
  flex: 1;
  min-width: 180px;
}

.consumption-calculator .stat .num {
  font-family: var(--cc-mono);
  font-size: 24px;
  font-weight: 600;
  color: var(--cc-ink);
}

.consumption-calculator .stat .lbl {
  font-size: 11.5px;
  color: var(--cc-ink-soft);
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-top: 2px;
}

.consumption-calculator .split {
  display: flex;
  gap: 26px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.consumption-calculator #pie-plot {
  flex: 1 1 420px;
  min-width: 300px;
}

.consumption-calculator #total-plot {
  width: 100%;
}

.consumption-calculator table {
  flex: 1 1 320px;
  min-width: 280px;
  border-collapse: collapse;
  font-size: 13px;
  align-self: stretch;
}

.consumption-calculator table caption {
  text-align: left;
  font-size: 11.5px;
  color: var(--cc-ink-soft);
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-bottom: 8px;
}

.consumption-calculator th,
.consumption-calculator td {
  text-align: left;
  padding: 7px 6px;
  border-bottom: 1px solid var(--cc-line);
}

.consumption-calculator th {
  font-family: var(--cc-mono);
  font-size: 11px;
  color: var(--cc-ink-soft);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.consumption-calculator td.num,
.consumption-calculator th.num {
  text-align: right;
  font-family: var(--cc-mono);
}

.consumption-calculator .swatch {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 2px;
  margin-right: 8px;
  vertical-align: middle;
}

.consumption-calculator tr.zero td {
  color: #A6AFBB;
}

.consumption-calculator footer {
  margin-top: 30px;
  font-size: 12px;
  color: var(--cc-ink-soft);
  text-align: center;
}

@media (max-width: 640px) {
  .consumption-calculator {
    padding-left: 14px;
    padding-right: 14px;
  }

  .consumption-calculator .card {
    padding: 18px;
  }

  .consumption-calculator h1 {
    font-size: 26px;
  }
}
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.27.0/plotly.min.js"></script>
<script>
const PALETTE = [
  '#146B69','#D98A2B','#4C6EF5','#B4472B','#8A6DBF',
  '#2F9E44','#C2410C','#0E7490','#A16207','#5B6B7A'
];

const DAYS_PER_YEAR = 365.25;

let parsedRows = [];   // array of {date, values:[...]} in original units
let headers = [];      // user column names (excludes date col)
let csvUnit = 'core-days';

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const filenameTag = document.getElementById('filename-tag');
const filenameText = document.getElementById('filename-text');
const clearFileBtn = document.getElementById('clear-file');
const errorMsg = document.getElementById('error-msg');
const rowSelectRow = document.getElementById('row-select-row');
const rowSelect = document.getElementById('row-select');
const resultsSection = document.getElementById('results-section');
const unitSelect = document.getElementById('unit-select');

unitSelect.addEventListener('change', () => {
  csvUnit = unitSelect.value;

  // Re-render an already loaded file immediately using the new unit.
  if (parsedRows.length && rowSelect.value !== '') {
    renderResults(Number(rowSelect.value));
  }
});

dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.classList.add('drag');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('drag');
});

dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('drag');

  if (e.dataTransfer.files.length) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', e => {
  if (e.target.files.length) {
    handleFile(e.target.files[0]);
  }
});

clearFileBtn.addEventListener('click', () => {
  fileInput.value = '';
  filenameTag.style.display = 'none';
  rowSelectRow.style.display = 'none';
  resultsSection.style.display = 'none';
  errorMsg.style.display = 'none';
  parsedRows = [];
  headers = [];
});

rowSelect.addEventListener('change', () => {
  renderResults(Number(rowSelect.value));
});

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = 'block';
  resultsSection.style.display = 'none';
  rowSelectRow.style.display = 'none';
}

function handleFile(file) {
  errorMsg.style.display = 'none';
  filenameText.textContent = file.name;
  filenameTag.style.display = 'flex';

  Papa.parse(file, {
    complete: (res) => {
      try {
        processData(res.data);
      } catch (err) {
        showError('Could not read this file: ' + err.message);
      }
    },
    error: (err) => showError('Could not parse CSV: ' + err.message)
  });
}

function processData(rows) {
  // Find header row: first row with more than 1 non-empty cell.
  let headerIdx = rows.findIndex(
    r => r.filter(c => c && c.trim() !== '').length > 1
  );

  if (headerIdx === -1) {
    throw new Error('no header row found');
  }

  const headerRow = rows[headerIdx];

  headers = headerRow
    .slice(1)
    .map(h => (h || '').trim())
    .filter(h => h !== '');

  const nUsers = headers.length;

  if (nUsers === 0) {
    throw new Error('no user columns found after the date column');
  }

  parsedRows = [];

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];

    if (!r || r.length === 0) {
      continue;
    }

    const dateCell = (r[0] || '').trim();

    if (!dateCell) {
      continue;
    }

    // Stop if this looks like a repeated header (non-numeric second cell).
    const vals = [];
    let looksNumeric = true;

    for (let c = 1; c <= nUsers; c++) {
      const raw = (r[c] || '').trim();
      const num = raw === '' ? 0 : Number(raw);

      if (raw !== '' && Number.isNaN(num)) {
        looksNumeric = false;
        break;
      }

      if (!Number.isFinite(num)) {
        looksNumeric = false;
        break;
      }

      vals.push(num);
    }

    if (!looksNumeric) {
      continue;
    }

    parsedRows.push({
      date: dateCell,
      values: vals
    });
  }

  if (parsedRows.length === 0) {
    throw new Error('no data rows found');
  }

  // Populate row selector in file order, defaulting to the last row.
  rowSelect.innerHTML = '';

  parsedRows.forEach((row, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = row.date;
    rowSelect.appendChild(opt);
  });

  const lastIdx = parsedRows.length - 1;
  rowSelect.value = lastIdx;
  rowSelectRow.style.display = 'block';

  renderResults(lastIdx);
}

function toCoreYears(value) {
  if (csvUnit === 'core-days') {
    return value / DAYS_PER_YEAR;
  }

  return value;
}

function getUnitLabel() {
  return csvUnit === 'core-days' ? 'core-days' : 'core-years';
}

function renderResults(idx) {
  const row = parsedRows[idx];

  const entries = headers.map((h, i) => ({
    name: h,
    value: toCoreYears(row.values[i] || 0)
  }))
  .sort((a, b) => b.value - a.value);

  const total = entries.reduce((s, e) => s + e.value, 0);
  const nonZero = entries.filter(e => e.value > 0);

  document.getElementById('results-sub').textContent =
    `As of ${row.date} — ${headers.length} user${headers.length !== 1 ? 's' : ''} in file — CSV values interpreted as ${getUnitLabel()}`;

  document.getElementById('stat-total').textContent = formatNum(total);
  document.getElementById('stat-users').textContent = nonZero.length;

  document.getElementById('stat-top').textContent =
    entries.length && total > 0
      ? entries[0].name.split(' (')[0] + '  ·  ' + pct(entries[0].value, total)
      : '–';

  // Table.
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';

  entries.forEach((e, i) => {
    const tr = document.createElement('tr');

    if (e.value === 0) {
      tr.classList.add('zero');
    }

    const color = PALETTE[i % PALETTE.length];

    tr.innerHTML = `
      <td><span class="swatch" style="background:${e.value > 0 ? color : '#D8DEE4'}"></span>${escapeHtml(e.name)}</td>
      <td class="num">${formatNum(e.value)}</td>
      <td class="num">${total > 0 ? pct(e.value, total) : '–'}</td>
    `;

    tbody.appendChild(tr);
  });

  // Pie chart.
  const pieEntries =
    total > 0
      ? (nonZero.length ? entries.filter(e => e.value > 0) : entries)
      : entries;

  const labels = pieEntries.map(e => e.name.split(' (')[0]);
  const values = pieEntries.map(e => e.value);
  const colors = pieEntries.map(
    e => PALETTE[entries.indexOf(e) % PALETTE.length]
  );

  const data = [{
    type: 'pie',
    labels: labels,
    values: values,
    hole: 0.52,
    marker: {
      colors: colors,
      line: {
        color: '#FFFFFF',
        width: 2
      }
    },
    textinfo: 'percent',
    textfont: {
      family: 'IBM Plex Mono',
      size: 11,
      color: '#FFFFFF'
    },
    hovertemplate: '%{label}<br>%{value:,.2f} core-years<br>%{percent}<extra></extra>',
    sort: false
  }];

  const layout = {
    margin: {
      t: 10,
      b: 10,
      l: 10,
      r: 10
    },
    showlegend: true,
    legend: {
      font: {
        family: 'Inter',
        size: 11.5,
        color: '#4B5B70'
      },
      orientation: 'v',
      x: 1.02,
      y: 0.5
    },
    height: 340,
    font: {
      family: 'Inter'
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    annotations: [{
      text: formatNum(total),
      showarrow: false,
      font: {
        family: 'IBM Plex Mono',
        size: 16,
        color: '#10233F'
      },
      x: 0.5,
      y: 0.5
    }]
  };

  Plotly.newPlot(
    'pie-plot',
    data,
    layout,
    {
      displayModeBar: false,
      responsive: true
    }
  );

  renderTotalChart(idx);

  resultsSection.style.display = 'block';
}

function renderTotalChart(selectedIdx) {
  const dates = parsedRows.map(r => r.date);
  const totals = parsedRows.map(
    r => r.values.reduce((s, v) => s + toCoreYears(v || 0), 0)
  );

  const lineTrace = {
    type: 'scatter',
    mode: 'lines+markers',
    x: dates,
    y: totals,
    line: {
      color: '#146B69',
      width: 2.5,
      shape: 'spline'
    },
    marker: {
      color: '#146B69',
      size: 5
    },
    hovertemplate: '%{x}<br>%{y:,.2f} core-years<extra></extra>',
    name: 'Total'
  };

  const highlightTrace = {
    type: 'scatter',
    mode: 'markers',
    x: [dates[selectedIdx]],
    y: [totals[selectedIdx]],
    marker: {
      color: '#D98A2B',
      size: 11,
      line: {
        color: '#FFFFFF',
        width: 2
      }
    },
    hovertemplate: '%{x}<br>%{y:,.2f} core-years<extra></extra>',
    showlegend: false,
    name: 'Selected'
  };

  const layout = {
    margin: {
      t: 10,
      b: 40,
      l: 55,
      r: 20
    },
    height: 300,
    showlegend: false,
    font: {
      family: 'Inter',
      size: 11.5,
      color: '#4B5B70'
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: {
      showgrid: false,
      tickfont: {
        family: 'IBM Plex Mono',
        size: 10
      }
    },
    yaxis: {
      title: {
        text: 'Core-years',
        font: {
          family: 'IBM Plex Mono',
          size: 11
        }
      },
      gridcolor: '#DCE3E8',
      zeroline: false,
      tickfont: {
        family: 'IBM Plex Mono',
        size: 10
      }
    },
    hovermode: 'closest'
  };

  Plotly.newPlot(
    'total-plot',
    [lineTrace, highlightTrace],
    layout,
    {
      displayModeBar: false,
      responsive: true
    }
  );
}

function formatNum(n) {
  return n.toLocaleString(undefined, {
    maximumFractionDigits: n >= 100 ? 0 : 2
  });
}

function pct(v, total) {
  return (total > 0 ? (v / total * 100) : 0).toFixed(1) + '%';
}

function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c])
  );
}
</script>