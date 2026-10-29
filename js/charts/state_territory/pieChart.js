// js/charts/state_territory/pieChart.js
import { COLORS } from '../../config.js';
import { formatNumber } from '../../utils/formatters.js';
import { addAriaLabel } from '../../utils/accessibility.js';

export function drawRoadUserPieChart(data, containerId, selectedYear, selectedState, selectedRoadUser, onFilter) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight; 
    const legendSpace = 80; 
    const chartHeight = height - legendSpace; 
    const radius = Math.min(width, chartHeight) / 2 - 10;

    d3.select(`#${containerId}`).html("");
    d3.selectAll(".pie-tooltip").remove();

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`) 
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Add hatch pattern
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

    // Group Data (Handle null as 0 for pie drawing, but mark as suppressed)
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
        .range(["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#6b7280"]);

    const arcs = pie(pieData);

    const tooltip = d3.select("body").append("div")
        .attr("class", "pie-tooltip")
        .style("opacity", 0).style("position", "absolute").style("background", COLORS.text)
        .style("color", "#fff").style("padding", "5px 10px").style("border-radius", "5px")
        .style("font-size", "12px").style("pointer-events", "none").style("z-index", "1000");

    let isClicking = false;

    const slices = chartGroup.selectAll(".slice")
        .data(arcs)
        .enter().append("path")
        .attr("class", "slice")
        .attr("d", arc)
        .attr("fill", d => d.data.isSuppressed ? "url(#hatch-pie)" : colorScale(d.data.category))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .style("opacity", d => selectedRoadUser === "All" || selectedRoadUser === d.data.category ? 1 : 0.3)
        .style("cursor", "pointer")
        .style("transition", "opacity 0.2s")
        
        .on("mouseover", function(event, d) {
            if (isClicking) return;
            d3.select(this).style("opacity", 0.8);
            let tooltipHtml = `<strong>${d.data.category}</strong><br>`;
            if (d.data.isSuppressed) {
                tooltipHtml += `<span style="color: #FCA5A5;">Data Suppressed (n.p.)</span>`;
            } else {
                tooltipHtml += `Count: ${formatNumber(d.data.value)}`;
            }
            tooltip.style("opacity", 1)
                .html(tooltipHtml)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            if (isClicking) return;
            d3.select(this).style("opacity", selectedRoadUser === "All" || selectedRoadUser === d.data.category ? 1 : 0.3);
            tooltip.style("opacity", 0);
        })
        .on("click", function(event, d) {
            tooltip.style("opacity", 0);
            isClicking = true;
            const newRoadUser = (selectedRoadUser === d.data.category) ? "All" : d.data.category;
            if (onFilter) onFilter(newRoadUser);
            setTimeout(() => { isClicking = false; }, 300);
        });

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
            .attr("fill", d.isSuppressed ? "url(#hatch-pie)" : colorScale(d.category));

        legendRow.append("text")
            .attr("x", 15).attr("y", 9)
            .text(d.category)
            .style("font-family", "Poppins")
            .style("font-size", "10px")
            .style("fill", COLORS.text)
            .style("alignment-baseline", "middle");
    });
}