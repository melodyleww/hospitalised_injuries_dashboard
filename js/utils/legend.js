import {
  POPULATION_COLORS,
  POPULATION_ORDER,
  POPULATION_LABELS,
} from "../config.js";

// Each item contains a label and its matching chart colour
export function drawLegend(containerId, items) {
  const container = d3.select(`#${containerId}`);

  // Clear the previous legend before rebuilding
  container.selectAll("*").remove();

  const legendItems = container
    .selectAll(".fn-legend-item")
    .data(items)
    .join("span")
    .attr("class", "fn-legend-item");

  legendItems
    .append("span")
    .attr("class", "fn-legend-swatch")
    .style("background-color", (item) => item.color)
    .attr("aria-hidden", "true");

  legendItems.append("span").text((item) => item.label);
}

// Shared population legend for age and road-user charts
export function drawPopulationLegend(containerId) {
  drawLegend(
    containerId,
    POPULATION_ORDER.map((population) => ({
      label: POPULATION_LABELS[population],
      color: POPULATION_COLORS[population],
    })),
  );
}
