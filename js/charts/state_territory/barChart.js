// js/charts/state_territory/barChart.js
import { COLORS } from '../../config.js';
import { formatNumber } from '../../utils/formatters.js';
import { addAriaLabel } from '../../utils/accessibility.js';

export function drawStateBarChart(data, popMap, containerId, selectedYear, viewMode, selectedRoadUser, selectedState, onFilter) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const margin = { top: 10, right: 50, bottom: 30, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    d3.select(`#${containerId}`).html("");
    d3.selectAll(".bar-tooltip").remove();

    const svg = d3.select(`#${containerId}`)
        .append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("defs").append("pattern")
        .attr("id", "hatch")
        .attr("width", 6).attr("height", 6)
        .attr("patternTransform", "rotate(45 0 0)")
        .attr("patternUnits", "userSpaceOnUse")
        .append("line")
        .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6)
        .attr("stroke", "#9CA3AF").attr("stroke-width", 2);

    addAriaLabel(svg, `Hospitalisations by state for ${selectedYear}.`);

    // 1. Filter Data and Resolve Duplicates
    let yearData;
    if (selectedRoadUser === "All") {
        yearData = data.filter(d => d.year === selectedYear && d.breakdown_type === "Total");
    } else {
        yearData = data.filter(d => d.year === selectedYear && d.breakdown_type === "Road User" && d.category === selectedRoadUser);
    }

    // Group by jurisdiction to handle cases where there are duplicate rows (e.g., OK and n.p.)
    const uniqueData = d3.group(yearData, d => d.jurisdiction);
    const chartData = [];

    uniqueData.forEach((values, jurisdiction) => {
        // Find if there is a valid, non-null value
        const validValue = values.find(v => v.hospitalisations !== null);

        const pop = popMap[jurisdiction] || 1;

        if (validValue) {
            // If a valid value exists, use it and ignore the suppressed rows
            const rate = (validValue.hospitalisations / pop) * 100000;
            chartData.push({
                jurisdiction: jurisdiction,
                value: viewMode === "count" ? validValue.hospitalisations : rate,
                rawCount: validValue.hospitalisations,
                rateValue: rate,
                isSuppressed: false
            });
        } else {
            // If NO valid value exists, then it is truly suppressed
            chartData.push({
                jurisdiction: jurisdiction,
                value: 0,
                rawCount: null,
                rateValue: 0,
                isSuppressed: true
            });
        }
    });

    // Sort (put suppressed to bottom, then by value)
    chartData.sort((a, b) => {
        if (a.isSuppressed && !b.isSuppressed) return 1;
        if (!a.isSuppressed && b.isSuppressed) return -1;
        return b.value - a.value;
    });

    const x = d3.scaleLinear().domain([0, d3.max(chartData, d => d.value || 0) * 1.1]).range([0, width]);
    const y = d3.scaleBand().domain(chartData.map(d => d.jurisdiction)).range([0, height]).padding(0.3);

    svg.append("g").call(d3.axisLeft(y).tickSize(0))
        .style("font-family", "Poppins").style("font-size", "10px").style("color", COLORS.text);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(4).tickFormat(formatNumber))
        .style("font-family", "Poppins").style("font-size", "9px").style("color", COLORS.muted);

    const tooltip = d3.select("body").append("div")
        .attr("class", "bar-tooltip")
        .style("opacity", 0).style("position", "absolute").style("background", COLORS.text)
        .style("color", "#fff").style("padding", "5px 10px").style("border-radius", "5px")
        .style("font-size", "12px").style("pointer-events", "none").style("z-index", "1000");

    let isClicking = false;

    // 2. Draw Bars (Handle Suppressed)
    svg.selectAll(".bar").data(chartData).enter().append("rect")
        .attr("x", 0).attr("y", d => y(d.jurisdiction))
        .attr("width", d => d.isSuppressed ? 15 : x(d.value)) // Small width for hatch
        .attr("height", y.bandwidth())
        .attr("fill", d => {
            if (d.isSuppressed) return "url(#hatch)";
            if (selectedState === "All") return COLORS.primary;
            return d.jurisdiction === selectedState ? COLORS.primary : "#D1D5DB";
        })
        .style("cursor", "pointer")
        .style("transition", "fill 0.2s")
        .on("mouseover", function (event, d) {
            if (isClicking) return;
            d3.select(this).style("opacity", 0.7);
            let tooltipHtml = `<strong>${d.jurisdiction}</strong><br>`;
            if (d.isSuppressed) {
                tooltipHtml += `<span style="color: #FCA5A5;">Data Suppressed (n.p.)</span>`;
            } else {
                tooltipHtml += `Count: ${formatNumber(d.rawCount)}<br>Rate: ${d.rateValue.toFixed(1)}`;
            }
            tooltip.style("opacity", 1)
                .html(tooltipHtml)
                .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            if (isClicking) return;
            d3.select(this).style("opacity", 1);
            tooltip.style("opacity", 0);
        })
        .on("click", function (event, d) {
            tooltip.style("opacity", 0);
            isClicking = true;
            if (onFilter) onFilter(d.jurisdiction);
            setTimeout(() => { isClicking = false; }, 300);
        });

    // Labels (Outside the bar for normal, inside for suppressed)
    svg.selectAll(".label").data(chartData).enter().append("text")
        .attr("x", d => d.isSuppressed ? 20 : x(d.value) + 5)
        .attr("y", d => y(d.jurisdiction) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .text(d => d.isSuppressed ? "n.p." : (viewMode === "count" ? formatNumber(d.value) : d.value.toFixed(1)))
        .style("font-family", "Poppins").style("font-size", "9px")
        .style("fill", d => d.isSuppressed ? "#6B7280" : COLORS.muted)
        .style("font-weight", d => d.isSuppressed ? "bold" : "normal");
}