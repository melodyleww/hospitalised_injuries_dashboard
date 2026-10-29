// js/charts/state_territory/lineChart.js
import { COLORS } from '../../config.js';
import { formatNumber, formatYear } from '../../utils/formatters.js';
import { addAriaLabel } from '../../utils/accessibility.js';

export function drawStateLineChart(data, containerId, selectedRoadUser = "All", selectedState = "All") {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Increase right margin to fit the legend
    const margin = { top: 20, right: 120, bottom: 40, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    d3.select(`#${containerId}`).html("");

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 1. Filter Data by Road User AND State
    let filteredData;
    if (selectedRoadUser === "All") {
        filteredData = data.filter(d => d.breakdown_type === "Total" && d.hospitalisations !== null);
    } else {
        filteredData = data.filter(d => d.breakdown_type === "Road User" && d.category === selectedRoadUser && d.hospitalisations !== null);
    }

    // Apply the State filter if a bar was clicked
    if (selectedState !== "All") {
        filteredData = filteredData.filter(d => d.jurisdiction === selectedState);
    }

    addAriaLabel(d3.select(`#${containerId} svg`), `Annual hospitalisation trends for ${selectedRoadUser} in ${selectedState}.`);

    // Handle empty data
    if (filteredData.length === 0) {
        svg.append("text")
            .attr("x", width / 2).attr("y", height / 2).attr("text-anchor", "middle")
            .text(`No data available`).style("font-family", "Poppins").style("fill", COLORS.muted);
        return;
    }

    const years = [...new Set(filteredData.map(d => d.year))].sort();

    const x = d3.scalePoint().domain(years).range([0, width]).padding(0.5);
    const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.hospitalisations) * 1.1])
        .range([height, 0]);

    // 2. Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(formatYear))
        .style("font-family", "Poppins").style("font-size", "10px").style("color", COLORS.muted);

    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(formatNumber))
        .style("font-family", "Poppins").style("font-size", "10px").style("color", COLORS.muted);

    // 3. Color Scale
    const jurisdictions = [...new Set(filteredData.map(d => d.jurisdiction))].sort();
    const colorScale = d3.scaleOrdinal()
        .domain(jurisdictions)
        .range(["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#6b7280"]);

    // 4. Line Generator
    const line = d3.line()
        .defined(d => d.hospitalisations !== null)
        .x(d => x(d.year))
        .y(d => y(d.hospitalisations));

    const groupedData = d3.group(filteredData, d => d.jurisdiction);

    // 5. Draw Lines
    groupedData.forEach((values, jurisdiction) => {
        svg.append("path")
            .datum(values.sort((a,b) => a.year - b.year))
            .attr("fill", "none")
            .attr("stroke", colorScale(jurisdiction))
            .attr("stroke-width", 2)
            .attr("d", line);
    });

    // 6. Draw Data Point Markers
    svg.selectAll(".marker")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "marker")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.hospitalisations))
        .attr("r", 3.5) 
        .attr("fill", d => colorScale(d.jurisdiction))
        .attr("stroke", "#FFFFFF") 
        .attr("stroke-width", 1)
        .style("cursor", "pointer");

    // 7. Data Quality Breaks
    const breakYears = [2012, 2017];
    breakYears.forEach(year => {
        if (x(year)) { // Only draw if the year exists in the current x-axis domain
            svg.append("line")
                .attr("x1", x(year)).attr("x2", x(year))
                .attr("y1", 0).attr("y2", height)
                .attr("stroke", COLORS.warning).attr("stroke-width", 1.5).attr("stroke-dasharray", "5,5");

            svg.append("text")
                .attr("x", x(year) + 5)
                .attr("y", 15)
                .text(year === 2012 ? "Vic break" : "NSW break")
                .style("font-family", "Poppins").style("font-size", "9px")
                .style("fill", COLORS.warning).style("font-weight", "bold");
        }
    });

    // 8. Tooltip
    const tooltip = d3.select("body").append("div")
        .style("opacity", 0).style("position", "absolute").style("background", COLORS.text)
        .style("color", "#fff").style("padding", "5px 10px").style("border-radius", "5px")
        .style("font-size", "12px").style("pointer-events", "none").style("z-index", "1000");

    svg.selectAll(".marker")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 6); 
            tooltip.style("opacity", 1)
                .html(`<strong>${d.jurisdiction}</strong><br>Year: ${d.year}<br>Count: ${formatNumber(d.hospitalisations)}`)
                .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 3.5); 
            tooltip.style("opacity", 0);
        });

    // 9. Legend (Only shows the states currently drawn)
    const legendGroup = svg.append("g")
        .attr("transform", `translate(${width + 20}, 10)`);

    jurisdictions.forEach((jurisdiction, i) => {
        const legendRow = legendGroup.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        legendRow.append("rect")
            .attr("x", 0).attr("y", 0)
            .attr("width", 12).attr("height", 12)
            .attr("fill", colorScale(jurisdiction));

        legendRow.append("text")
            .attr("x", 20).attr("y", 10)
            .text(jurisdiction)
            .style("font-family", "Poppins")
            .style("font-size", "11px")
            .style("fill", COLORS.text)
            .style("alignment-baseline", "middle");
    });
}