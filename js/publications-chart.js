/**
 * Publications-per-year bar chart for publications.md.
 * Counts come from the markdown source; update them when adding entries.
 */
(function () {
  "use strict";

  function render() {
    const el = document.getElementById("publications-per-year");
    if (!el || typeof Plotly === "undefined") return;

    const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
    const journals = [2, 6, 8, 11, 8, 11, 7, 9, 7];

    const isDark = document.body.getAttribute("data-md-color-scheme") === "slate";
    const fontColor = isDark ? "#e0e0e0" : "#212121";
    const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

    const data = [{
      x: years,
      y: journals,
      type: "bar",
      marker: { color: "#1b9e77" },
      hovertemplate: "%{y} publications in %{x}<extra></extra>",
    }];

    const layout = {
      margin: { t: 30, r: 10, b: 40, l: 40 },
      height: 240,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: fontColor, family: "Roboto, sans-serif" },
      xaxis: {
        tickmode: "linear",
        gridcolor: gridColor,
        tickfont: { size: 14, family: "Roboto, sans-serif", weight: 700 },
      },
      yaxis: {
        title: {
          text: "Journal articles",
          font: { size: 14, family: "Roboto, sans-serif", weight: 700 },
        },
        gridcolor: gridColor,
        tickfont: { size: 13, family: "Roboto, sans-serif", weight: 700 },
      },
      showlegend: false,
    };

    Plotly.newPlot(el, data, layout, { displayModeBar: false, responsive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }

  // Re-render on Material's instant navigation
  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(render);
  }
})();
