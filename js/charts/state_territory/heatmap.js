// js/charts/state_territory/heatmap.js
import { COLORS } from '../../config.js';
import { formatNumber } from '../../utils/formatters.js';
import { addAriaLabel } from '../../utils/accessibility.js';

export function drawAgeHeatmap(data, containerId, selectedRoadUser = "All", selectedState = "All") {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Update the Dynamic Title
    const titleEl = document.getElementById("heatmapTitle");
    if (titleEl) {
        let title = "Age Group Over Time ";
        title += (selectedState !== "All") ? `(${selectedState})` : `(All States)`;
        titleEl.innerText = title;
    }

    const margin = { top: 30, right: 20, bottom: 40, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    d3.select(`#${containerId}`).html("");
    d3.selectAll(".heatmap-tooltip").remove();

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    addAriaLabel(svg, `Heatmap showing hospitalisations by age group over time for ${selectedState}.`);

    // 2. Filter Data (Only Age Group breakdown)
    let filteredData = data.filter(d => d.breakdown_type === "Age Group" && d.hospitalisations !== null);
    
    if (selectedState !== "All") {
        filteredData = filteredData.filter(d => d.jurisdiction === selectedState);
    }
    
    // 3. Group Data
    const years = [...new Set(filteredData.map(d => d.year))].sort();
    const ageGroups = ["0-7", "8-16", "17-25", "26-39", "40-64", "65+"];

    const nestedData = d3.rollup(
        filteredData,
        v => d3.sum(v, d => d.hospitalisations),
        d => d.year,
        d => d.category
    );

    const heatmapData = [];
    years.forEach(year => {
        ageGroups.forEach(age => {
            const val = nestedData.get(year)?.get(age) || 0;
            heatmapData.push({ year, ageGroup: age, value: val });
        });
    });

    // 4. Scales
    const x = d3.scaleBand().domain(years).range([0, width]).padding(0.05);
    const y = d3.scaleBand().domain(ageGroups).range([0, height]).padding(0.05);

    const maxVal = d3.max(heatmapData, d => d.value);
    const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateBlues)
        .domain([0, maxVal]);

    // 5. Draw Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .style("font-family", "Poppins").style("font-size", "10px");

    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-family", "Poppins").style("font-size", "10px");

    // 6. Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "heatmap-tooltip")
        .style("opacity", 0).style("position", "absolute").style("background", COLORS.text)
        .style("color", "#fff").style("padding", "5px 10px").style("border-radius", "5px")
        .style("font-size", "12px").style("pointer-events", "none").style("z-index", "1000");

    // 7. Draw Cells
    svg.selectAll(".cell")
        .data(heatmapData)
        .enter().append("rect")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.ageGroup))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => d.value > 0 ? colorScale(d.value) : "#F4F7F6")
        .style("stroke", "#FFFFFF")
        .style("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).style("stroke", COLORS.text).style("stroke-width", 2);
            tooltip.style("opacity", 1)
                .html(`
                    <strong>Year: ${d.year}</strong><br>
                    Age: ${d.ageGroup}<br>
                    Count: ${formatNumber(d.value)}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).style("stroke", "#FFFFFF").style("stroke-width", 1);
            tooltip.style("opacity", 0);
        });
}