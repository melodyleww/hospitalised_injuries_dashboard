//road user paired bar chart
import { attachTooltip, hideTooltip } from "../../utils/tooltip.js";
import { drawPopulationLegend } from "../../utils/legend.js";
import { POPULATION_COLORS, POPULATION_ORDER } from "../../config.js";

// Keep category order consistent when filters change
const ROAD_USER_ORDER = [
  "Car driver, passenger or unknown position",
  "Motorcyclist",
  "Pedal cyclist",
  "Pedestrian",
  "Heavy transport driver, passenger or unknown position",
  "Pick-up truck or van occupant",
  "Bus occupant",
  "Other or unknown",
];

// Short display labels; original category values stay unchanged
const ROAD_USER_LABELS = {
  "Car driver, passenger or unknown position": "Car occupants",
  "Heavy transport driver, passenger or unknown position":
    "Heavy transport occupants",
  "Pick-up truck or van occupant": "Pick-up / van occupants",
  "Bus occupant": "Bus occupants",
  "Other or unknown": "Other / unknown",
};

export function drawRoadUserChart(rows) {
  const container = document.getElementById("fnRoadChart");

  hideTooltip();
  container.replaceChildren();

  drawPopulationLegend("fnRoadLegend");

  // Find the largest available count; missing values are ignored
  const maxCount = d3.max(rows, (row) => row.hospitalisations);

  if (maxCount == null) {
    const message = document.createElement("p");
    message.className = "fn-chart-message";
    message.textContent =
      "Published road-user counts are unavailable for this selection.";

    container.append(message);
    return;
  }

  // Measure the available card space
  const width = container.clientWidth;
  const height = container.clientHeight;

  const margin = {
    top: 10,
    right: 25,
    bottom: 40,
    left: 160,
  };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  if (innerWidth <= 0 || innerHeight <= 0) {
    console.warn("The road-user chart needs more drawing space.");
    return;
  }

  // Create SVG and inner drawing area
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "group")
    .attr("aria-label", "Road-user hospitalisation counts by population");

  const innerChart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Counts use a common zero baseline
  const xScale = d3
    .scaleLinear()
    .domain([0, Math.max(1, maxCount * 1.1)])
    .nice()
    .range([0, innerWidth]);

  const yScale = d3
    .scaleBand()
    .domain(ROAD_USER_ORDER)
    .range([0, innerHeight])
    .padding(0.1);

  // Horizontal count axis
  innerChart
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(4).tickFormat(d3.format(",d")));

  // Category axis uses shorter, readable labels
  innerChart.append("g").call(
    d3
      .axisLeft(yScale)
      .tickSize(4)
      .tickPadding(8)
      .tickFormat((category) => ROAD_USER_LABELS[category] || category),
  );

  svg
    .append("text")
    .attr("class", "fn-axis-title")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .text("Hospitalisations");

  // Find the populations included in the current selection
  const populations = POPULATION_ORDER.filter((population) =>
    rows.some((row) => row.first_nations_status === population),
  );

  // Divide each road-user row into population slots
  const populationScale = d3
    .scaleBand()
    .domain(populations)
    .range([0, yScale.bandwidth()])
    .padding(0.05);

  const publishedRows = rows.filter((row) => row.hospitalisations !== null);

  const missingRows = rows.filter((row) => row.hospitalisations === null);

  // Draw only published numeric counts
  // Missing values are handled separately below
  const bars = innerChart
    .selectAll(".fn-road-bar")
    .data(publishedRows, (row) => `${row.category}-${row.first_nations_status}`)
    .join("rect")
    .attr("class", "fn-road-bar")
    .attr("x", 0)
    .attr(
      "y",
      (row) => yScale(row.category) + populationScale(row.first_nations_status),
    )
    .attr("width", (row) => xScale(row.hospitalisations))
    .attr("height", populationScale.bandwidth())
    .attr("fill", (row) => POPULATION_COLORS[row.first_nations_status]);

  // Display published counts beside the bars.
  const countLabels = innerChart
    .selectAll(".fn-road-count")
    .data(publishedRows, (row) => `${row.category}-${row.first_nations_status}`)
    .join("text")
    .attr("class", "fn-road-count")
    .attr("x", (row) => xScale(row.hospitalisations) + 5)
    .attr(
      "y",
      (row) =>
        yScale(row.category) +
        populationScale(row.first_nations_status) +
        populationScale.bandwidth() / 2,
    )
    .attr("dominant-baseline", "middle")
    .text((row) => d3.format(",d")(row.hospitalisations));

  // Label unavailable counts instead of drawing zero-length bars.
  const missingLabels = innerChart
    .selectAll(".fn-road-missing")
    .data(missingRows, (row) => `${row.category}-${row.first_nations_status}`)
    .join("text")
    .attr("class", "fn-road-missing")
    .attr("x", 5)
    .attr(
      "y",
      (row) =>
        yScale(row.category) +
        populationScale(row.first_nations_status) +
        populationScale.bandwidth() / 2,
    )
    .attr("dominant-baseline", "middle")
    .text("Not published");

  // Bars and their count labels describe the same record
  function roadUserTooltip(row) {
    return {
      title: ROAD_USER_LABELS[row.category] || row.category,
      lines: [`Hospitalisations: ${d3.format(",d")(row.hospitalisations)}`],
      context: `${row.first_nations_status}, ${row.year}`,
    };
  }

  attachTooltip(bars, roadUserTooltip);
  attachTooltip(countLabels, roadUserTooltip);

  // Missing labels also explain which population is affected
  attachTooltip(missingLabels, (row) => ({
    title: ROAD_USER_LABELS[row.category] || row.category,
    lines: ["Hospitalisations: Not published"],
    context: `${row.first_nations_status}, ${row.year}`,
  }));
}
