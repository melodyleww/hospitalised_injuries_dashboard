// js/charts/state_territory/pieChart.js
import { COLORS } from '../../config.js';
import { formatNumber } from '../../utils/formatters.js';
import { addAriaLabel, enableGridNavigation } from '../../utils/accessibility.js';
import { attachTooltip, hideTooltip } from '../../utils/tooltip.js';

export function drawRoadUserPieChart(data, containerId, selectedYear, selectedState, selectedRoadUser, onFilter) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const legendSpace = 80;
    const chartHeight = height - legendSpace;
    const radius = Math.min(width, chartHeight) / 2 - 10;

    d3.select(`#${containerId}`).html("");
    hideTooltip();

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    svg.append("defs").append("pattern")
        .attr("id", "hatch-pie")
        .attr("width", 6).attr("height", 6)
        .attr("patternTransform", "rotate(45 0 0)")
        .attr("patternUnits", "userSpaceOnUse")
        .append("line")
        .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6)
        .attr("stroke", "#9CA3AF").attr("stroke-width", 2);

    const chartGroup = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${chartHeight / 2})`);

    addAriaLabel(svg, `Road user composition for ${selectedYear}.`);

    let filteredData = data.filter(d => d.year === selectedYear && d.breakdown_type === "Road User");
    if (selectedState !== "All") {
        filteredData = filteredData.filter(d => d.jurisdiction === selectedState);
    }

    const groupedData = d3.rollup(filteredData, v => {
        const sum = d3.sum(v, d => d.hospitalisations);
        const hasSuppressed = v.some(d => d.hospitalisations === null);
        return { sum: sum, hasSuppressed: hasSuppressed };
    }, d => d.category);

    const pieData = Array.from(groupedData, ([category, obj]) => ({
        category,
        value: obj.sum,
        isSuppressed: obj.sum === 0 && obj.hasSuppressed
    })).sort((a, b) => b.value - a.value);

    if (pieData.length === 0) return;

    const pie = d3.pie().value(d => d.value).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

    const colorScale = d3.scaleOrdinal()
        .domain(pieData.map(d => d.category))
        .range(["#0072B2", "#D55E00", "#009E73", "#E69F00", "#CC79A7", "#56B4E9", "#F0E442", "#999999"]);
    const arcs = pie(pieData);

    const isSelected = (d) => selectedRoadUser === "All" || selectedRoadUser === d.data.category;
    const restingOpacity = (d) => isSelected(d) ? 1 : 0.3;

    const slices = chartGroup.selectAll(".slice")
        .data(arcs)
        .enter().append("path")
        .attr("class", "slice")
        .attr("d", arc)
        .attr("fill", d => d.data.isSuppressed ? "url(#hatch-pie)" : colorScale(d.data.category))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .style("opacity", d => restingOpacity(d))
        .style("cursor", "pointer")
        .style("transition", "opacity 0.2s");

    // Hover/rest opacity: independent of tooltip, uses separate handlers.
    slices
        .on("mouseenter.opacity", function (event, d) {
            d3.select(this).style("opacity", isSelected(d) ? 0.8 : restingOpacity(d));
        })
        .on("mouseleave.opacity", function (event, d) {
            d3.select(this).style("opacity", restingOpacity(d));
        });

    // Shared tooltip (attaches focus/blur too)
    attachTooltip(slices, (d) => {
        if (d.data.isSuppressed) {
            return {
                title: d.data.category,
                lines: ["Data suppressed (n.p.)"],
                context: `Road user, ${selectedYear}`
            };
        }
        return {
            title: d.data.category,
            lines: [`Hospitalisations: ${formatNumber(d.data.value)}`],
            context: `Road user, ${selectedYear}`
        };
    });

    // Keyboard activation (Enter / Space)
    slices.on("keydown.activate", function (event, d) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            hideTooltip();
            const newRoadUser = (selectedRoadUser === d.data.category) ? "All" : d.data.category;
            if (onFilter) onFilter(newRoadUser);
        }
    });
    slices.on("click.activate", function (event, d) {
        hideTooltip();
        const newRoadUser = (selectedRoadUser === d.data.category) ? "All" : d.data.category;
        if (onFilter) onFilter(newRoadUser);
    });

    // Roving tabindex: linear ring navigation.
    enableGridNavigation(slices);

    // Legend
    const legendGroup = svg.append("g")
        .attr("transform", `translate(10, ${chartHeight + 5})`);
    const itemsPerCol = Math.ceil(pieData.length / 2);

    pieData.forEach((d, i) => {
        const col = Math.floor(i / itemsPerCol);
        const row = i % itemsPerCol;
        const xOffset = col * (width / 2);
        const yOffset = row * 16;

        const legendRow = legendGroup.append("g")
            .attr("transform", `translate(${xOffset}, ${yOffset})`);

        legendRow.append("rect")
            .attr("x", 0).attr("y", 0)
            .attr("width", 10).attr("height", 10)
            .attr("fill", d.isSuppressed ? "url(#hatch-pie)" : colorScale(d.category))
            .attr("aria-hidden", "true");

        legendRow.append("text")
            .attr("x", 15).attr("y", 9)
            .text(d.category)
            .style("font-family", "Poppins")
            .style("font-size", "10px")
            .style("fill", COLORS.text)
            .style("alignment-baseline", "middle")
            .attr("aria-hidden", "true");
    });
}