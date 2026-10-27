// js/charts/national/barCharts.js
import { COLORS, MARGINS } from '../../config.js';
import { formatNumber } from '../../utils/formatters.js';
import { addAriaLabel } from '../../utils/accessibility.js';

export function drawRoadUserChart(data, containerId, selectedYear = 2021, selectedRoadUser = "All", selectedAgeGroup = "All") {
    const container = document.getElementById(containerId);
    const margin = MARGINS.barHorizontal;
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    d3.select(`#${containerId}`).html("");

    const svg = d3.select(`#${containerId}`)
        .append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    addAriaLabel(d3.select(`#${containerId} svg`), `Horizontal bar chart showing hospitalisations by road user for ${selectedYear}.`);

    let filteredData = data.filter(d => d.year === selectedYear);
    if (selectedAgeGroup !== "All") {
        filteredData = filteredData.filter(d => d.age_group === selectedAgeGroup);
    }

    const totals = d3.rollup(filteredData, v => d3.sum(v, d => d.hospitalisations), d => d.road_user);
    const ruData = Array.from(totals, ([roadUser, total]) => ({ roadUser, total })).sort((a, b) => b.total - a.total);

    const x = d3.scaleLinear().domain([0, d3.max(ruData, d => d.total) * 1.1]).range([0, width]); 
    const y = d3.scaleBand().domain(ruData.map(d => d.roadUser)).range([0, height]).padding(0.2);

    svg.append("g").call(d3.axisLeft(y).tickSize(0))
        .style("font-family", "Poppins").style("font-size", "10px").style("color", COLORS.text);

    svg.selectAll(".bar").data(ruData).enter().append("rect")
        .attr("x", 0).attr("y", d => y(d.roadUser))
        .attr("width", d => x(d.total)).attr("height", y.bandwidth())
        .attr("fill", d => {
            if (selectedRoadUser === "All") return COLORS.primary;
            return d.roadUser === selectedRoadUser ? COLORS.primary : "#D1D5DB"; 
        })
        .style("cursor", "pointer")
        .style("transition", "opacity 0.2s")
        .on("click", function(event, d) {
            const roadUserSelect = document.getElementById("roadUserFilter");
            roadUserSelect.value = d.roadUser;
            roadUserSelect.dispatchEvent(new Event('change'));
        })
        .on("mouseover", function() { d3.select(this).style("opacity", 0.7); })
        .on("mouseout", function() { d3.select(this).style("opacity", 1); });

    svg.selectAll(".label").data(ruData).enter().append("text")
        .attr("x", d => x(d.total) + 5)
        .attr("y", d => y(d.roadUser) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .text(d => formatNumber(d.total))
        .style("font-family", "Poppins").style("font-size", "9px").style("fill", COLORS.muted);
}

export function drawAgeGroupChart(data, containerId, selectedYear = 2021, selectedAgeGroup = "All") {
    const container = document.getElementById(containerId);
    const margin = MARGINS.barVertical;
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    d3.select(`#${containerId}`).html("");

    const svg = d3.select(`#${containerId}`)
        .append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    addAriaLabel(d3.select(`#${containerId} svg`), `Vertical bar chart showing hospitalisations by age group for ${selectedYear}.`);

    const yearData = data.filter(d => d.year === selectedYear);
    const totals = d3.rollup(yearData, v => d3.sum(v, d => d.hospitalisations), d => d.age_group);
    const ageOrder = ["0-7", "8-16", "17-25", "26-39", "40-64", "65+"];
    const ageData = Array.from(totals, ([ageGroup, total]) => ({ ageGroup, total })).sort((a, b) => ageOrder.indexOf(a.ageGroup) - ageOrder.indexOf(b.ageGroup));

    const x = d3.scaleBand().domain(ageData.map(d => d.ageGroup)).range([0, width]).padding(0.25);
    const y = d3.scaleLinear().domain([0, d3.max(ageData, d => d.total) * 1.1]).range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickSize(0)).style("font-family", "Poppins").style("font-size", "10px");
    
    svg.append("g").call(d3.axisLeft(y).ticks(4).tickFormat(formatNumber))
        .style("font-family", "Poppins").style("font-size", "10px").style("color", COLORS.muted);

    svg.selectAll(".bar").data(ageData).enter().append("rect")
        .attr("x", d => x(d.ageGroup)).attr("y", d => y(d.total))
        .attr("width", x.bandwidth()).attr("height", d => height - y(d.total))
        // NEW: Conditional coloring based on selectedAgeGroup
        .attr("fill", d => {
            if (selectedAgeGroup === "All") return COLORS.secondary;
            return d.ageGroup === selectedAgeGroup ? COLORS.secondary : "#D1D5DB"; 
        })
        .style("cursor", "pointer")
        .style("transition", "opacity 0.2s")
        .on("click", function(event, d) {
            // Toggle logic: if it's already selected, deselect it
            const newSelected = (selectedAgeGroup === d.ageGroup) ? "All" : d.ageGroup;
            
            // Call the global update function we will expose in main.js
            window.applyAgeFilter(newSelected);
        })
        .on("mouseover", function() { d3.select(this).style("opacity", 0.7); })
        .on("mouseout", function() { d3.select(this).style("opacity", 1); });
}