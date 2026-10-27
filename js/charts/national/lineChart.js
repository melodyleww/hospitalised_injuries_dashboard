import { COLORS, MARGINS } from '../../config.js';

export function drawLineChart(data, containerId) {
    const container = document.getElementById(containerId);
    const margin = MARGINS.line;
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    // Clear existing chart
    d3.select(`#${containerId}`).html("");

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Aggregate by year
    const yearlyData = d3.rollup(data, v => d3.sum(v, d => d.hospitalisations), d => d.year);
    const trendData = Array.from(yearlyData, ([year, total]) => ({ year, total })).sort((a,b) => a.year - b.year);

    const x = d3.scalePoint().domain(trendData.map(d => d.year)).range([0, width]).padding(0.5);
    const y = d3.scaleLinear().domain([0, d3.max(trendData, d => d.total) * 1.1]).range([height, 0]);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .style("font-family", "Poppins").style("font-size", "10px").style("color", COLORS.muted);

    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(",")))
        .style("font-family", "Poppins").style("font-size", "10px").style("color", COLORS.muted);

    // Line path
    const line = d3.line().x(d => x(d.year)).y(d => y(d.total));
    svg.append("path").datum(trendData).attr("fill", "none").attr("stroke", COLORS.primary).attr("stroke-width", 2.5).attr("d", line);

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .style("opacity", 0).style("position", "absolute").style("background", COLORS.text)
        .style("color", "#fff").style("padding", "5px 10px").style("border-radius", "5px")
        .style("font-size", "12px").style("pointer-events", "none").style("z-index", "1000");

    // Dots
    svg.selectAll(".dot")
        .data(trendData).enter().append("circle")
        .attr("cx", d => x(d.year)).attr("cy", d => y(d.total))
        .attr("r", 4).attr("fill", COLORS.primary)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 6).attr("fill", COLORS.text);
            tooltip.style("opacity", 1)
                .html(`Year: ${d.year}<br>Hospitalisations: ${d3.format(",")(d.total)}`)
                .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 4).attr("fill", COLORS.primary);
            tooltip.style("opacity", 0);
        });

    // Time series breaks (2012 & 2017)
    [2012, 2017].forEach(year => {
        svg.append("line")
            .attr("x1", x(year)).attr("x2", x(year))
            .attr("y1", 0).attr("y2", height)
            .attr("stroke", COLORS.warning).attr("stroke-width", 1.5).attr("stroke-dasharray", "5,5");
    });
}