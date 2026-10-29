// js/charts/state_territory/barChart.js
import { COLORS } from '../../config.js';
import { formatNumber } from '../../utils/formatters.js';
import { addAriaLabel } from '../../utils/accessibility.js';

export function drawStateBarChart(data, popMap, containerId, selectedYear, viewMode, selectedRoadUser, selectedState, onFilter) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Adjusted margins to give more room for labels on the right
    const margin = { top: 10, right: 50, bottom: 30, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    d3.select(`#${containerId}`).html("");
    
    // Remove any old tooltips to prevent ghosting
    d3.selectAll(".bar-tooltip").remove();

    const svg = d3.select(`#${containerId}`)
        .append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    addAriaLabel(svg, `Hospitalisations by state for ${selectedYear}.`);

    let yearData;
    if (selectedRoadUser === "All") {
        yearData = data.filter(d => d.year === selectedYear && d.breakdown_type === "Total" && d.hospitalisations !== null);
    } else {
        yearData = data.filter(d => d.year === selectedYear && d.breakdown_type === "Road User" && d.category === selectedRoadUser && d.hospitalisations !== null);
    }

    const chartData = yearData.map(d => {
        const pop = popMap[d.jurisdiction] || 1;
        const rate = (d.hospitalisations / pop) * 100000;
        return {
            jurisdiction: d.jurisdiction,
            value: viewMode === "count" ? d.hospitalisations : rate,
            rawCount: d.hospitalisations,
            rateValue: rate
        };
    }).sort((a, b) => b.value - a.value);

    const x = d3.scaleLinear().domain([0, d3.max(chartData, d => d.value) * 1.1]).range([0, width]); 
    const y = d3.scaleBand().domain(chartData.map(d => d.jurisdiction)).range([0, height]).padding(0.2);

    // Y Axis (States)
    svg.append("g").call(d3.axisLeft(y).tickSize(0))
        .style("font-family", "Poppins").style("font-size", "10px").style("color", COLORS.text);

    // X Axis (Values)
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

    // Draw Bars
    svg.selectAll(".bar").data(chartData).enter().append("rect")
        .attr("x", 0).attr("y", d => y(d.jurisdiction))
        .attr("width", d => x(d.value)).attr("height", y.bandwidth())
        .attr("fill", d => {
            if (selectedState === "All") return COLORS.primary;
            return d.jurisdiction === selectedState ? COLORS.primary : "#D1D5DB"; 
        })
        .style("cursor", "pointer")
        .style("transition", "fill 0.2s")
        
        .on("mouseover", function(event, d) {
            if (isClicking) return; 
            d3.select(this).style("opacity", 0.7);
            const rateDisplay = ((d.rawCount / (popMap[d.jurisdiction] || 1)) * 100000).toFixed(1);
            tooltip.style("opacity", 1)
                .html(`<strong>${d.jurisdiction}</strong><br>Count: ${formatNumber(d.rawCount)}<br>Rate: ${rateDisplay}`)
                .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            if (isClicking) return; 
            d3.select(this).style("opacity", 1);
            tooltip.style("opacity", 0);
        })
        .on("click", function(event, d) {
            tooltip.style("opacity", 0);
            isClicking = true;
            if (onFilter) onFilter(d.jurisdiction);
            setTimeout(() => { isClicking = false; }, 300);
        });

    // Draw Labels (Outside the bar, grey color)
    svg.selectAll(".label").data(chartData).enter().append("text")
        .attr("x", d => x(d.value) + 5) // Place outside the bar (add 5px padding)
        .attr("y", d => y(d.jurisdiction) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .text(d => viewMode === "count" ? formatNumber(d.value) : d.value.toFixed(1))
        .style("font-family", "Poppins").style("font-size", "9px")
        .style("fill", COLORS.muted) // Grey/dark grey color
        .style("font-weight", "normal");
}