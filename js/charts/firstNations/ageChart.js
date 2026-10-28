// Keep age categories in their natural order.
const AGE_ORDER = ["0-7", "8-16", "17-25", "26-39", "40-64", "65+"];

// Population
const POPULATION_ORDER = ["First Nations people", "Non-Indigenous"];
// Use the same population colours across the dashboard
const POPULATION_COLORS = {
  "First Nations people": "#3864A0",
  "Non-Indigenous": "#287A5B",
};

export function drawAgeChart(rows) {
  const container = document.getElementById("fnAgeChart");

  // Remove the previous chart when a filter changes.
  container.replaceChildren();

  // Do not draw an incomplete percentage distribution.
  if (
    rows.length === 0 ||
    rows.some((row) => row.hospitalisation_share_pct === null)
  ) {
    const message = document.createElement("p");
    message.className = "fn-chart-message";
    message.textContent =
      "Complete age percentages are unavailable " +
      "because some age counts were not published.";

    container.append(message);
    return;
  }

  // Measure the available card space instead of using fixed heights.
  const width = container.clientWidth;
  const height = container.clientHeight;

  const margin = {
    top: 10,
    right: 20,
    bottom: 40,
    left: 65,
  };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  if (innerWidth <= 0 || innerHeight <= 0) {
    console.warn("The age chart needs more drawing space.");
    return;
  }

  // Create the outer SVG.
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "Age distribution of hospitalisations");

  // Move the drawing origin inside the margins.
  const innerChart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Horizontal position represents percentage.
  // Keep the same scale across years and populations.
  const xScale = d3.scaleLinear().domain([0, 40]).range([0, innerWidth]);

  // Vertical position represents the six age categories.
  const yScale = d3
    .scaleBand()
    .domain(AGE_ORDER)
    .range([0, innerHeight])
    .padding(0.2);

  // Bottom percentage axis.
  innerChart
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(
      d3
        .axisBottom(xScale)
        .ticks(5)
        .tickFormat((value) => `${value}%`),
    );

  // Left age-group axis.
  innerChart
    .append("g")
    .call(d3.axisLeft(yScale).tickSize(0).tickPadding(8))
    .call((group) => group.select(".domain").remove());

  // Horizontal-axis label.
  svg
    .append("text")
    .attr("class", "fn-axis-title")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .text("Share within population (%)");

  // Grouped bars
  // Identify the populations included in the current selection.
  const populations = POPULATION_ORDER.filter((population) =>
    rows.some((row) => row.first_nations_status === population),
  );

  // Divide each age row into one or two population slots.
  const populationScale = d3
    .scaleBand()
    .domain(populations)
    .range([0, yScale.bandwidth()])
    .padding(0.12);

  // Draw one rectangle for each age/population record.
  const bars = innerChart
    .selectAll(".fn-age-bar")
    .data(rows, (row) => `${row.category}-${row.first_nations_status}`)
    .join("rect")
    .attr("class", "fn-age-bar")
    .attr("x", 0)
    .attr(
      "y",
      (row) => yScale(row.category) + populationScale(row.first_nations_status),
    )
    .attr("width", (row) => xScale(row.hospitalisation_share_pct))
    .attr("height", populationScale.bandwidth())
    .attr("fill", (row) => POPULATION_COLORS[row.first_nations_status]);

  // Provide a basic description for each bar.
  bars
    .append("title")
    .text(
      (row) =>
        `${row.first_nations_status}, ages ${row.category}: ` +
        `${row.hospitalisation_share_pct.toFixed(2)}% ` +
        `(${row.hospitalisations} hospitalisations)`,
    );
}
