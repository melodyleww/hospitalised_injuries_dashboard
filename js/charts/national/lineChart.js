// js/charts/national/lineChart.js

import { COLORS, MARGINS } from '../../config.js';
import { formatNumber, formatYear } from '../../utils/formatters.js';
import { addAriaLabel } from '../../utils/accessibility.js';

// Helper function to announce text to screen readers
const announce = (text) => {
    const announcer = document.getElementById("sr-announcer");
    if (announcer) {
        announcer.textContent = text;
    }
};

export function drawLineChart(data, containerId) {
    const container = document.getElementById(containerId);
    const margin = MARGINS.line;
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    d3.select(`#${containerId}`).html("");

    const svg = d3.select(`#${containerId}`)
        .append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    addAriaLabel(d3.select(`#${containerId} svg`), "Line chart showing the national trend of hospitalised injuries from road crashes from 2011 to 2021. Note: Dotted lines indicate time-series breaks.");

    const yearlyData = d3.rollup(data, v => d3.sum(v, d => d.hospitalisations), d => d.year);
    const trendData = Array.from(yearlyData, ([year, total]) => ({ year, total })).sort((a,b) => a.year - b.year);

    const x = d3.scalePoint().domain(trendData.map(d => d.year)).range([0, width]).padding(0.5);
    const y = d3.scaleLinear().domain([0, d3.max(trendData, d => d.total) * 1.1]).range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(formatYear))
        .style("font-family", "Poppins").style("font-size", "10px").style("color", COLORS.muted);

    svg.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(formatNumber))
        .style("font-family", "Poppins").style("font-size", "10px").style("color", COLORS.muted);

    const line = d3.line().x(d => x(d.year)).y(d => y(d.total));
    svg.append("path").datum(trendData).attr("fill", "none").attr("stroke", COLORS.primary).attr("stroke-width", 2.5).attr("d", line);

    const tooltip = d3.select("body").append("div")
        .attr("class", "chart-tooltip")
        .style("opacity", 0).style("position", "absolute").style("background", COLORS.text)
        .style("color", "#fff").style("padding", "5px 10px").style("border-radius", "5px")
        .style("font-size", "12px").style("pointer-events", "none").style("z-index", "1000");

    svg.selectAll(".dot").data(trendData).enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year)).attr("cy", d => y(d.total))
        .attr("r", 4).attr("fill", COLORS.primary)
        .attr("tabindex", 0)
        .attr("aria-label", d => `Year ${d.year}: ${formatNumber(d.total)} hospitalisations`)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 6).attr("fill", COLORS.text);
            tooltip.style("opacity", 1)
                .html(`Year: ${d.year}<br>Hospitalisations: ${formatNumber(d.total)}`)
                .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 4).attr("fill", COLORS.primary);
            tooltip.style("opacity", 0);
        })
        .on("focus", function(event, d) {
            d3.select(this).attr("r", 6).attr("fill", COLORS.text);
            const rect = this.getBoundingClientRect();
            tooltip.style("opacity", 1)
                .html(`Year: ${d.year}<br>Hospitalisations: ${formatNumber(d.total)}`)
                .style("left", (rect.right + window.scrollX + 10) + "px").style("top", (rect.top + window.scrollY) + "px");
            announce(`Year ${d.year}: ${formatNumber(d.total)} hospitalisations`);
        })
        .on("blur", function() {
            d3.select(this).attr("r", 4).attr("fill", COLORS.primary);
            tooltip.style("opacity", 0);
            announce("");
        });

    // Dynamic break lines from data quality flags (KNIME now populates these)
    const breakYears = [...new Set(data.filter(d => d.data_quality_flag && d.data_quality_flag !== "").map(d => d.year))];

    breakYears.forEach(year => {
        if(x(year)) {
            svg.append("line")
                .attr("x1", x(year)).attr("x2", x(year))
                .attr("y1", 0).attr("y2", height)
                .attr("stroke", COLORS.warning).attr("stroke-width", 1.5).attr("stroke-dasharray", "5,5");
        }
    });
}