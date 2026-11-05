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

// Draw legend entries for the selected populations.
export function drawPopulationLegend(
  containerId,
  populations = POPULATION_ORDER,
) {
  drawLegend(
    containerId,
    populations.map((population) => ({
      label: POPULATION_LABELS[population],
      color: POPULATION_COLORS[population],
    })),
  );
}
