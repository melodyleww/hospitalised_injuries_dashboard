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
