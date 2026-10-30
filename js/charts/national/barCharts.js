// js/charts/national/barCharts.js

import { COLORS, MARGINS } from '../../config.js';
import { formatNumber } from '../../utils/formatters.js';
import { addAriaLabel } from '../../utils/accessibility.js';

const createTooltip = () => {
    return d3.select("body").append("div")
        .attr("class", "chart-tooltip")
        .style("opacity", 0).style("position", "absolute").style("background", COLORS.text)
        .style("color", "#fff").style("padding", "5px 10px").style("border-radius", "5px")
        .style("font-size", "12px").style("pointer-events", "none").style("z-index", "1000");
};

const announce = (text) => {
    const announcer = document.getElementById("sr-announcer");
    if (announcer) announcer.textContent = text;
};

export function drawRoadUserChart(data, containerId, selectedYear = "All", selectedRoadUser = "All", selectedAgeGroup = "All") {
    const container = document.getElementById(containerId);
    const margin = MARGINS.barHorizontal;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) {
        console.warn("Road user chart needs more space");
        return;
    }

    d3.select(`#${containerId}`).html("");

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("role", "group")
        .attr("aria-label", "Horizontal bar chart showing hospitalisations by road user.")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let filteredData = data;
    if (selectedYear !== "All") {
        const yearNum = typeof selectedYear === 'string' ? parseInt(selectedYear, 10) : selectedYear;
        filteredData = filteredData.filter(d => d.year === yearNum);
    }
    if (selectedAgeGroup !== "All") {
        filteredData = filteredData.filter(d => d.age_group === selectedAgeGroup);
    }

    if (filteredData.length === 0) {
        svg.append("text").attr("x", innerWidth / 2).attr("y", innerHeight / 2).attr("text-anchor", "middle").text("No data for this selection").style("fill", COLORS.muted).style("font-size", "14px");
        return;
    }

    const totals = d3.rollup(filteredData, v => d3.sum(v, d => d.hospitalisations), d => d.road_user);
    const ruData = Array.from(totals, ([roadUser, total]) => ({ roadUser, total })).sort((a, b) => b.total - a.total);

    if (ruData.length === 0) {
        svg.append("text").attr("x", innerWidth / 2).attr("y", innerHeight / 2).attr("text-anchor", "middle").text("No data for this selection").style("fill", COLORS.muted).style("font-size", "14px");
        return;
    }

    const x = d3.scaleLinear().domain([0, (d3.max(ruData, d => d.total) || 1) * 1.1]).range([0, innerWidth]);
    const y = d3.scaleBand().domain(ruData.map(d => d.roadUser)).range([0, innerHeight]).padding(0.2);

    svg.append("g").call(d3.axisLeft(y).tickSize(0))
        .style("font-family", "Poppins").style("font-size", "12px").style("color", COLORS.text);

    const tooltip = createTooltip();

    svg.selectAll(".bar").data(ruData).enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0).attr("y", d => y(d.roadUser))
        .attr("width", d => x(d.total)).attr("height", y.bandwidth())
        .attr("fill", d => {
            if (selectedRoadUser === "All") return COLORS.primary;
            return d.roadUser === selectedRoadUser ? COLORS.primary : "#9CA3AF";
        })
        .attr("tabindex", 0)
        .attr("aria-label", d => `${d.roadUser}: ${formatNumber(d.total)} hospitalisations`)
        .style("cursor", "pointer")
        .style("transition", "opacity 0.2s")
        .on("click", function(event, d) {
            const roadUserSelect = document.getElementById("roadUserFilter");
            roadUserSelect.value = d.roadUser;
            roadUserSelect.dispatchEvent(new Event('change'));
        })
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 0.7);
            tooltip.style("opacity", 1)
                .html(`${d.roadUser}<br><strong>${formatNumber(d.total)}</strong> cases`)
                .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).style("opacity", 1);
            tooltip.style("opacity", 0);
        })
        .on("focus", function(event, d) {
            d3.select(this).style("opacity", 0.7);
            const rect = this.getBoundingClientRect();
            tooltip.style("opacity", 1)
                .html(`${d.roadUser}<br><strong>${formatNumber(d.total)}</strong> cases`)
                .style("left", (rect.right + window.scrollX + 10) + "px").style("top", (rect.top + window.scrollY) + "px");
            announce(`${d.roadUser}: ${formatNumber(d.total)} hospitalisations`);
        })
        .on("blur", function() {
            d3.select(this).style("opacity", 1);
            tooltip.style("opacity", 0);
            announce("");
        });

    svg.selectAll(".label").data(ruData).enter().append("text")
        .attr("x", d => x(d.total) + 5)
        .attr("y", d => y(d.roadUser) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .text(d => formatNumber(d.total))
        .style("font-family", "Poppins").style("font-size", "11px").style("fill", COLORS.muted);
}

export function drawAgeGroupChart(data, containerId, selectedYear = "All", selectedAgeGroup = "All", selectedRoadUser = "All") {
    const container = document.getElementById(containerId);
    const margin = MARGINS.barVertical;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) {
        console.warn("Age group chart needs more space");
        return;
    }

    d3.select(`#${containerId}`).html("");

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("role", "group")
        .attr("aria-label", "Vertical bar chart showing hospitalisations by age group.")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let yearData = data;
    if (selectedYear !== "All") {
        const yearNum = typeof selectedYear === 'string' ? parseInt(selectedYear, 10) : selectedYear;
        yearData = yearData.filter(d => d.year === yearNum);
    }
    if (selectedRoadUser !== "All") {
        yearData = yearData.filter(d => d.road_user === selectedRoadUser);
    }

    if (yearData.length === 0) {
        svg.append("text").attr("x", innerWidth / 2).attr("y", innerHeight / 2).attr("text-anchor", "middle").text("No data for this selection").style("fill", COLORS.muted).style("font-size", "14px");
        return;
    }

    const totals = d3.rollup(yearData, v => d3.sum(v, d => d.hospitalisations), d => d.age_group);
    const ageOrder = ["0-7", "8-16", "17-25", "26-39", "40-64", "65+"];
    const ageData = Array.from(totals, ([ageGroup, total]) => ({ ageGroup, total })).sort((a, b) => ageOrder.indexOf(a.ageGroup) - ageOrder.indexOf(b.ageGroup));

    if (ageData.length === 0) {
        svg.append("text").attr("x", innerWidth / 2).attr("y", innerHeight / 2).attr("text-anchor", "middle").text("No data for this selection").style("fill", COLORS.muted).style("font-size", "14px");
        return;
    }

    const x = d3.scaleBand().domain(ageData.map(d => d.ageGroup)).range([0, innerWidth]).padding(0.25);
    const y = d3.scaleLinear().domain([0, (d3.max(ageData, d => d.total) || 1) * 1.1]).range([innerHeight, 0]);

    svg.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).tickSize(0)).style("font-family", "Poppins").style("font-size", "12px");

    svg.append("g").call(d3.axisLeft(y).ticks(4).tickFormat(formatNumber))
        .style("font-family", "Poppins").style("font-size", "12px").style("color", COLORS.muted);

    const tooltip = createTooltip();

    svg.selectAll(".bar").data(ageData).enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.ageGroup)).attr("y", d => y(d.total))
        .attr("width", x.bandwidth()).attr("height", d => innerHeight - y(d.total))
        .attr("fill", d => {
            if (selectedAgeGroup === "All") return COLORS.secondary;
            return d.ageGroup === selectedAgeGroup ? COLORS.secondary : "#9CA3AF";
        })
        .attr("tabindex", 0)
        .attr("aria-label", d => `Age group ${d.ageGroup}: ${formatNumber(d.total)} hospitalisations`)
        .style("cursor", "pointer")
        .style("transition", "opacity 0.2s")
        .on("click", function(event, d) {
            const newSelected = (selectedAgeGroup === d.ageGroup) ? "All" : d.ageGroup;
            window.applyAgeFilter(newSelected);
        })
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 0.7);
            tooltip.style("opacity", 1)
                .html(`Age ${d.ageGroup}<br><strong>${formatNumber(d.total)}</strong> cases`)
                .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).style("opacity", 1);
            tooltip.style("opacity", 0);
        })
        .on("focus", function(event, d) {
            d3.select(this).style("opacity", 0.7);
            const rect = this.getBoundingClientRect();
            tooltip.style("opacity", 1)
                .html(`Age ${d.ageGroup}<br><strong>${formatNumber(d.total)}</strong> cases`)
                .style("left", (rect.right + window.scrollX + 10) + "px").style("top", (rect.top + window.scrollY) + "px");
            announce(`Age group ${d.ageGroup}: ${formatNumber(d.total)} hospitalisations`);
        })
        .on("blur", function() {
            d3.select(this).style("opacity", 1);
            tooltip.style("opacity", 0);
            announce("");
        });
}