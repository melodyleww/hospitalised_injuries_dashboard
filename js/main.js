document.addEventListener("DOMContentLoaded", () => {
  console.log("main.js loaded");
  console.log("D3 version:", d3.version);
  console.log("CONFIG:", CONFIG);

  drawScaffoldTest();
});

/**
 * Draws a simple test bar chart to confirm D3 is wired up correctly.
 * Delete this function once real charts are in place.
 */
function drawScaffoldTest() {
  const data = [40, 80, 120, 60, 100];

  const svg = d3.select("#test-chart");
  const { width, height, margin } = CONFIG;

  const innerW = width  - margin.left - margin.right;
  const innerH = height - margin.top  - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(d3.range(data.length))
    .range([0, innerW])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .nice()
    .range([innerH, 0]);

  g.selectAll("rect")
    .data(data)
    .join("rect")
      .attr("x", (_, i) => x(i))
      .attr("y", d => y(d))
      .attr("width", x.bandwidth())
      .attr("height", d => innerH - y(d))
      .attr("fill", CONFIG.colours.primary);
}