// js/charts/state_territory/heatmap.js
import { formatNumber } from '../../utils/formatters.js';
import { addAriaLabel, enableGridNavigation } from '../../utils/accessibility.js';
import { attachTooltip, hideTooltip } from '../../utils/tooltip.js';

export function drawAgeHeatmap(data, containerId, selectedRoadUser = "All", selectedState = "All") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const titleEl = document.getElementById("heatmapTitle");
    if (titleEl) {
        let title = "Age Group Over Time ";
        title += (selectedState !== "All") ? `(${selectedState})` : `(All States)`;
        titleEl.innerText = title;
    }

    const margin = { top: 0, right: 20, bottom: 30, left: 60 };
    const totalWidth  = container.clientWidth;
    const totalHeight = container.clientHeight;

    if (totalWidth <= 0 || totalHeight <= 0) {
        console.warn("The heatmap needs more drawing space.");
        return;
    }

    const width  = totalWidth  - margin.left - margin.right;
    const height = totalHeight - margin.top  - margin.bottom;

    if (width <= 0 || height <= 0) {
        console.warn("The heatmap needs more drawing space.");
        return;
    }

    // Cap the grid height on very tall/wide cards so cells don't become stretched. The extra vertical space is centred.
    const MAX_GRID_HEIGHT = 300;
    const gridHeight   = Math.min(height, MAX_GRID_HEIGHT);
    const gridOffsetY  = (height - gridHeight) / 2;

    d3.select(`#${containerId}`).html("");
    hideTooltip();

    // Keep viewBox 1:1 with rendered pixels and use "meet".
    // Because totalWidth/totalHeight match the rendered <svg> size,
    // there is no scaling: text stays at its true pixel size and the
    // grid keeps its aspect ratio on every screen width.
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", totalWidth)
        .attr("height", totalHeight)
        .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top + gridOffsetY})`);

    svg.append("defs").append("pattern")
        .attr("id", "hatch-heat")
        .attr("width", 6).attr("height", 6)
        .attr("patternTransform", "rotate(45 0 0)")
        .attr("patternUnits", "userSpaceOnUse")
        .append("line")
        .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6)
        .attr("stroke", "#9CA3AF").attr("stroke-width", 2);

    addAriaLabel(svg, `Heatmap showing hospitalisations by age group over time.`);

    let filteredData = data.filter(d => d.breakdown_type === "Age Group");
    if (selectedState !== "All") {
        filteredData = filteredData.filter(d => d.jurisdiction === selectedState);
    }

    const years = [...new Set(filteredData.map(d => d.year))].sort();
    const ageGroups = ["0-7", "8-16", "17-25", "26-39", "40-64", "65+"];

    const nestedData = d3.rollup(
        filteredData,
        v => {
            const sum = d3.sum(v, d => d.hospitalisations);
            const hasSuppressed = v.some(d => d.hospitalisations === null);
            return { sum, hasSuppressed };
        },
        d => d.year,
        d => d.category
    );

    const heatmapData = [];
    years.forEach(year => {
        ageGroups.forEach(age => {
            const obj = nestedData.get(year)?.get(age);
            heatmapData.push({
                year,
                ageGroup: age,
                value: obj ? obj.sum : 0,
                isSuppressed: obj ? obj.sum === 0 && obj.hasSuppressed : false
            });
        });
    });

    const x = d3.scaleBand().domain(years).range([0, width]).padding(0.05);
    const y = d3.scaleBand().domain(ageGroups).range([0, gridHeight]).padding(0.05);

    const maxVal = d3.max(heatmapData, d => d.value);
    const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateBlues)
        .domain([0, maxVal]);

    // X axis at the bottom of the grid.
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0,${gridHeight})`);

    const bandWidth = x.bandwidth();
    const rotateLabels = bandWidth < 34;

    xAxisGroup
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .style("font-family", "Poppins")
        .style("font-size", rotateLabels ? "9px" : "10px");

    if (rotateLabels) {
        xAxisGroup
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("dx", "-0.4em")
            .attr("dy", "0.4em");
    }

    // Y axis with tighter tick styling.
    const yAxisGroup = svg.append("g")
        .call(d3.axisLeft(y).tickSize(4).tickPadding(6));

    yAxisGroup
        .style("font-family", "Poppins")
        .style("font-size", "10px");

    if (y.bandwidth() < 22) {
        yAxisGroup.selectAll("text").style("font-size", "9px");
    }

    const cells = svg.selectAll(".cell")
        .data(heatmapData)
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.ageGroup))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => {
            if (d.isSuppressed) return "url(#hatch-heat)";
            return d.value > 0 ? colorScale(d.value) : "#F4F7F6";
        })
        .style("stroke", "#FFFFFF")
        .style("stroke-width", 1)
        .style("cursor", "pointer");

    // Shared tooltip
    attachTooltip(cells, (d) => {
        if (d.isSuppressed) {
            return {
                title: `Year ${d.year}, age ${d.ageGroup}`,
                lines: ["Data suppressed (n.p.)"],
                context: `Age group ${d.ageGroup}`
            };
        }
        return {
            title: `Year ${d.year}, age ${d.ageGroup}`,
            lines: [`Hospitalisations: ${formatNumber(d.value)}`],
            context: `Age group ${d.ageGroup}`
        };
    });

    // Roving tabindex: 2-D grid navigation (years × age groups)
    // GenAI Acknowledgement: The logic to map the Up/Down/Left/Right keys to the 
    // 2D index of the years and age groups was developed with guidance from Deepseek AI
    const yearIndex = new Map(years.map((yy, i) => [yy, i]));
    const ageIndex  = new Map(ageGroups.map((a, i) => [a, i]));

    enableGridNavigation(cells, {
        cols: (d) => yearIndex.get(d.year),
        rows: (d) => ageIndex.get(d.ageGroup),
        colCount: years.length,
        rowCount: ageGroups.length
    });
}