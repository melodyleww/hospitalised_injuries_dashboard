// js/charts/state_territory/barChart.js
import { COLORS } from '../../config.js';
import { formatNumber } from '../../utils/formatters.js';
import { addAriaLabel, enableGridNavigation } from '../../utils/accessibility.js';

const announce = (text) => {
    const announcer = document.getElementById("sr-announcer");
    if (announcer) announcer.textContent = text;
};

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
        .attr("role", "group")
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

    let yearData;
    if (selectedRoadUser === "All") {
        yearData = data.filter(d => d.year === selectedYear && d.breakdown_type === "Total");
    } else {
        yearData = data.filter(d => d.year === selectedYear && d.breakdown_type === "Road User" && d.category === selectedRoadUser);
    }

    const uniqueData = d3.group(yearData, d => d.jurisdiction);
    const chartData = [];

    uniqueData.forEach((values, jurisdiction) => {
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

    const barAriaLabel = (d) => {
        if (d.isSuppressed) {
            return `${d.jurisdiction}: data suppressed, not published`;
        }
        const unit = viewMode === "count" ? "hospitalisations" : "per 100,000 population";
        return `${d.jurisdiction}: ${formatNumber(d.value)} ${unit}`;
    };

    const bars = svg.selectAll(".bar").data(chartData).enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0).attr("y", d => y(d.jurisdiction))
        .attr("width", d => d.isSuppressed ? 15 : x(d.value))
        .attr("height", y.bandwidth())
        .attr("fill", d => {
            if (d.isSuppressed) return "url(#hatch)";
            if (selectedState === "All") return COLORS.primary;
            return d.jurisdiction === selectedState ? COLORS.primary : "#D1D5DB";
        })
        .style("cursor", "pointer")
        .style("transition", "fill 0.2s")
        .attr("role", "img")
        .attr("aria-label", barAriaLabel);

    const showBarTooltip = (event, d, el) => {
        d3.select(el).style("opacity", 0.7);
        let tooltipHtml = `<strong>${d.jurisdiction}</strong><br>`;
        if (d.isSuppressed) {
            tooltipHtml += `<span style="color: #FCA5A5;">Data Suppressed (n.p.)</span>`;
        } else {
            tooltipHtml += `Hospitalisations: ${formatNumber(d.rawCount)}<br>Rate: ${d.rateValue.toFixed(1)}`;
        }
        tooltip.style("opacity", 1)
            .html(tooltipHtml)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    };

    const hideBarTooltip = (el) => {
        d3.select(el).style("opacity", 1);
        tooltip.style("opacity", 0);
    };

    bars
        .on("mouseover", function (event, d) { showBarTooltip(event, d, this); })
        .on("mouseout", function () { hideBarTooltip(this); })
        .on("focus", function (event, d) {
            const bounds = this.getBoundingClientRect();
            showBarTooltip(
                { pageX: bounds.right + window.scrollX, pageY: bounds.top + window.scrollY },
                d,
                this
            );
            announce(barAriaLabel(d));
        })
        .on("blur", function () {
            hideBarTooltip(this);
            announce("");
        })
        .on("keydown", function (event, d) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (onFilter) onFilter(d.jurisdiction);
            }
        })
        .on("click", function (event, d) {
            tooltip.style("opacity", 0);
            if (onFilter) onFilter(d.jurisdiction);
        });

    // Roving tabindex: one Tab stop, arrow keys move between bars vertically.
    enableGridNavigation(bars, {
        cols: () => 0,
        rows: (d, i) => i,
        colCount: 1,
        rowCount: chartData.length
    });

    svg.selectAll(".label").data(chartData).enter().append("text")
        .attr("x", d => d.isSuppressed ? 20 : x(d.value) + 5)
        .attr("y", d => y(d.jurisdiction) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("aria-hidden", "true")
        .text(d => d.isSuppressed ? "n.p." : (viewMode === "count" ? formatNumber(d.value) : d.value.toFixed(1)))
        .style("font-family", "Poppins").style("font-size", "9px")
        .style("fill", d => d.isSuppressed ? "#6B7280" : COLORS.muted)
        .style("font-weight", d => d.isSuppressed ? "bold" : "normal");
}