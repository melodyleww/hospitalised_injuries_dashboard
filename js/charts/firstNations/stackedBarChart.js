//counterparty
import { COLORS, COUNTERPARTY_COLORS } from "../../config.js";
import { attachTooltip, hideTooltip } from "../../utils/tooltip.js";
import { drawLegend } from "../../utils/legend.js";

const POPULATION_ORDER = ["First Nations people", "Non-Indigenous"];

const POPULATION_LABELS = {
  "First Nations people": "First Nations peoples",
  "Non-Indigenous": "Non-Indigenous Australians",
};

const COUNTERPARTY_ORDER = [
  "Car, pick-up truck or van",
  "Fixed or stationary object",
  "Non-collision transport accident",
  "Other",
];

export function drawStackedBarChart(rows) {
  const container = document.getElementById("fnCounterpartyChart");
  container.replaceChildren();

  hideTooltip();

  // Keep a consistent population order across filter selection
  const populations = POPULATION_ORDER.filter((population) =>
    rows.some((row) => row.first_nations_status === population),
  );

  // Each population needs all four published category percentage
  const complete =
    populations.length > 0 &&
    populations.every((population) => {
      const group = rows.filter(
        (row) => row.first_nations_status === population,
      );

      return (
        group.length === COUNTERPARTY_ORDER.length &&
        COUNTERPARTY_ORDER.every((category) =>
          group.some(
            (row) =>
              row.category === category &&
              row.hospitalisation_share_pct !== null,
          ),
        )
      );
    });

  if (!complete) {
    const message = document.createElement("p");
    message.className = "fn-chart-message";
    message.textContent =
      "A complete counterparty distribution is unavailable.";

    container.append(message);
    return;
  }

  // Use the space available inside the card.
  const width = container.clientWidth;
  const height = container.clientHeight;

  const margin = {
    top: 8,
    right: 15,
    bottom: 30,
    left: 175,
  };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  if (innerWidth <= 0 || innerHeight <= 0) {
    console.warn("The counterparty chart needs more drawing space.");
    return;
  }

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "group")
    .attr("aria-label", "Counterparty distribution within each population");

  const innerChart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Every complete stacked bar represents 100%
  const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

  // Each population occupies one horizontal row
  const yScale = d3
    .scaleBand()
    .domain(populations)
    .range([0, innerHeight])
    .padding(0.35);

  innerChart
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(
      d3
        .axisBottom(xScale)
        .ticks(5)
        .tickFormat((value) => `${value}%`),
    );

  innerChart
    .append("g")
    .call(
      d3
        .axisLeft(yScale)
        .tickSize(0)
        .tickPadding(8)
        .tickFormat((population) => POPULATION_LABELS[population]),
    )
    .call((group) => group.select(".domain").remove());

  // Stacked segments
  // Convert long-format records into one object per population.
  const stackData = populations.map((population) => {
    const record = { population };

    COUNTERPARTY_ORDER.forEach((category) => {
      const row = rows.find(
        (row) =>
          row.first_nations_status === population && row.category === category,
      );

      record[category] = row.hospitalisation_share_pct;
    });

    return record;
  });

  // Calculate each segment's starting and ending percentages.
  const stackGenerator = d3.stack().keys(COUNTERPARTY_ORDER);

  const series = stackGenerator(stackData);

  // Use a consistent colour for each counterparty.
  const colorScale = d3
    .scaleOrdinal()
    .domain(COUNTERPARTY_ORDER)
    .range(COUNTERPARTY_COLORS);

  // Draw one group per counterparty category.
  const categoryGroups = innerChart
    .selectAll(".fn-counterparty-series")
    .data(series)
    .join("g")
    .attr("class", "fn-counterparty-series")
    .attr("fill", (series) => colorScale(series.key));

  // Prepare the same segment data for rectangles and labels.
  function getSegments(series) {
    return series.map((segment) => ({
      category: series.key,
      population: segment.data.population,
      start: segment[0],
      end: segment[1],
    }));
  }
  // Draw one segment per population within each category group.
  const segments = categoryGroups
    .selectAll("rect")
    .data(getSegments)
    .join("rect")
    .attr("class", "fn-counterparty-segment")
    .attr("x", (segment) => xScale(segment.start))
    .attr("y", (segment) => yScale(segment.population))
    .attr("width", (segment) => xScale(segment.end) - xScale(segment.start))
    .attr("height", yScale.bandwidth())
    .attr("stroke", COLORS.white)
    .attr("stroke-width", 1);

  // Find the original count record for a drawn segment.
  function getRecord(segment) {
    return rows.find(
      (row) =>
        row.first_nations_status === segment.population &&
        row.category === segment.category,
    );
  }

  // Supply counterparty-specific content to the shared tooltip.
  attachTooltip(segments, (segment) => {
    const row = getRecord(segment);

    return {
      title: row.category,
      lines: [
        `Hospitalisations: ${d3.format(",d")(row.hospitalisations)}`,
        `Share: ${row.hospitalisation_share_pct.toFixed(2)}%`,
      ],
      context: `${POPULATION_LABELS[segment.population]}, ${row.year}`,
    };
  });

  // Add a percentage label at the centre of each segment
  categoryGroups
    .selectAll(".fn-counterparty-value")
    .data(getSegments)
    .join("text")
    .attr("class", "fn-counterparty-value")
    // Middle of the segment horizontally
    .attr("x", (segment) => xScale((segment.start + segment.end) / 2))
    // Middle of the population bar vertically
    .attr("y", (segment) => yScale(segment.population) + yScale.bandwidth() / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    // Dark text on the lighter blue; white on the darker colours
    .attr("fill", COLORS.white)

    // Hide labels that cannot fit inside narrow segment
    .text((segment) => {
      const segmentWidth = xScale(segment.end) - xScale(segment.start);

      return segmentWidth >= 50
        ? `${(segment.end - segment.start).toFixed(1)}%`
        : "";
    });

  // Use the same legend helper, with counterparty labels and colours
  drawLegend(
    "fnCounterpartyLegend",
    COUNTERPARTY_ORDER.map((category) => ({
      label: category,
      color: colorScale(category),
    })),
  );
}
