// js/charts/state_territory/pieChart.js
import { COLORS } from '../../config.js';
import { formatNumber } from '../../utils/formatters.js';
import { addAriaLabel } from '../../utils/accessibility.js';

export function drawRoadUserPieChart(data, containerId, selectedYear, selectedState, selectedRoadUser, onFilter) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth || 350; 
    const height = 400; 
    const chartHeight = 250;
    const radius = Math.min(width, chartHeight) / 2 - 20;

    d3.select(`#${containerId}`).html("");
    d3.selectAll(".pie-tooltip").remove();

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const chartGroup = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${chartHeight / 2})`);

    addAriaLabel(svg, `Road user composition for ${selectedYear}.`);

    let filteredData = data.filter(d => d.year === selectedYear && d.breakdown_type === "Road User" && d.hospitalisations !== null);
    if (selectedState !== "All") {
        filteredData = filteredData.filter(d => d.jurisdiction === selectedState);
    }

    const groupedData = d3.rollup(filteredData, v => d3.sum(v, d => d.hospitalisations), d => d.category);
    const pieData = Array.from(groupedData, ([category, value]) => ({ category, value })).sort((a, b) => b.value - a.value);

    if (pieData.length === 0) return;

    const pie = d3.pie().value(d => d.value).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

    const colorScale = d3.scaleOrdinal()
        .domain(pieData.map(d => d.category))
        .range(["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#6b7280"]);

    const arcs = pie(pieData);

    const tooltip = d3.select("body").append("div")
        .attr("class", "pie-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", COLORS.text)
        .style("color", "#fff")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000");

    // FLAG to stop hover events right after a click
    let isClicking = false;

    const slices = chartGroup.selectAll(".slice")
        .data(arcs)
        .enter().append("path")
        .attr("class", "slice")
        .attr("d", arc)
        .attr("fill", d => colorScale(d.data.category))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .style("opacity", d => selectedRoadUser === "All" || selectedRoadUser === d.data.category ? 1 : 0.3)
        .style("cursor", "pointer")
        .style("transition", "opacity 0.2s")
        
        .on("mouseover", function(event, d) {
            // If we just clicked, ignore this hover
            if (isClicking) return;

            // Restore normal opacity for the hovered slice
            d3.select(this).style("opacity", 0.8);
            
            tooltip.style("opacity", 1)
                .html(`<strong>${d.data.category}</strong><br>Count: ${formatNumber(d.data.value)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        
        .on("mouseout", function(event, d) {
            if (isClicking) return;

            // Restore opacity based on filter state
            d3.select(this).style("opacity", selectedRoadUser === "All" || selectedRoadUser === d.data.category ? 1 : 0.3);
            tooltip.style("opacity", 0);
        })

        .on("click", function(event, d) {
            // 1. Hide tooltip
            tooltip.style("opacity", 0);
            
            // 2. Set the flag to block mouseover events
            isClicking = true;
            
            // 3. Redraw the chart (this destroys the current DOM)
            const newRoadUser = (selectedRoadUser === d.data.category) ? "All" : d.data.category;
            if (onFilter) onFilter(newRoadUser);

            // 4. Wait 300ms, then allow hover events again
            setTimeout(() => {
                isClicking = false;
            }, 300);
        });

    // --- LEGEND BELOW CHART ---
    const legendGroup = svg.append("g")
        .attr("transform", `translate(10, ${chartHeight + 20})`); 

    const itemsPerCol = Math.ceil(pieData.length / 2);
    
    pieData.forEach((d, i) => {
        const col = Math.floor(i / itemsPerCol); 
        const row = i % itemsPerCol;
        
        const xOffset = col * (width / 2); 
        const yOffset = row * 20; 

        const legendRow = legendGroup.append("g")
            .attr("transform", `translate(${xOffset}, ${yOffset})`);
        
        legendRow.append("rect")
            .attr("x", 0).attr("y", 0)
            .attr("width", 12).attr("height", 12)
            .attr("fill", colorScale(d.category));

        legendRow.append("text")
            .attr("x", 18).attr("y", 10)
            .text(d.category)
            .style("font-family", "Poppins")
            .style("font-size", "11px")
            .style("fill", COLORS.text)
            .style("alignment-baseline", "middle");
    });
}