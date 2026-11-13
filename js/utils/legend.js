// This file draws reusable chart legends (coloured swatches + labels) and
// a specialised helper for population legends

import {
  POPULATION_COLORS,
  POPULATION_ORDER,
  POPULATION_LABELS,
} from "../config.js";

// Each item contains a label and its matching chart colour
// Builds a legend inside the given container element
export function drawLegend(containerId, items) {
  const container = d3.select(`#${containerId}`);

  // Clear the previous legend before rebuilding
  container.selectAll("*").remove();

  // One <span> per legend item
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

  // Text label
  legendItems.append("span").text((item) => item.label);
}

// Draw legend entries for the selected populations
// Uses shared population colours and display labels from config.js
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
