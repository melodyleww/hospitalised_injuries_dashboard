// js/charts/state_territory/lineChart.js
import { COLORS } from '../../config.js';
import { formatNumber, formatYear } from '../../utils/formatters.js';
import { addAriaLabel } from '../../utils/accessibility.js';
import { attachTooltip, hideTooltip } from '../../utils/tooltip.js';

const announce = (text) => {
    const announcer = document.getElementById("sr-announcer");
    if (announcer) announcer.textContent = text;
};

export function drawStateLineChart(data, containerId, selectedRoadUser = "All", selectedState = "All") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const isVerySmall = window.innerWidth < 480;

    let margin;
    if (isVerySmall) {
        margin = { top: 20, right: 20, bottom: 120, left: 50 };
    } else if (isMobile) {
        margin = { top: 20, right: 20, bottom: 90, left: 60 };
    } else {
        margin = { top: 20, right: 200, bottom: 40, left: 60 };
    }

    const totalWidth = container.clientWidth;
    const totalHeight = container.clientHeight;

    if (totalWidth <= 0 || totalHeight <= 0) {
        console.warn("The line chart needs more drawing space.");
        return;
    }

    const width = totalWidth - margin.left - margin.right;
    const height = totalHeight - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) {
        console.warn("The line chart needs more drawing space.");
        return;
    }

    d3.select(`#${containerId}`).html("");
    hideTooltip();

    // width/height and viewBox match 1:1 in CSS pixels so text renders
    // at its true size and is NOT scaled down on narrow windows.
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", totalWidth)
        .attr("height", totalHeight)
        .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 3. Filter Data
    let filteredData;
    if (selectedRoadUser === "All") {
        filteredData = data.filter(d => d.breakdown_type === "Total" && d.hospitalisations !== null);
    } else {
        filteredData = data.filter(d => d.breakdown_type === "Road User" && d.category === selectedRoadUser && d.hospitalisations !== null);
    }

    if (selectedState !== "All") {
        filteredData = filteredData.filter(d => d.jurisdiction === selectedState);
    }

    addAriaLabel(d3.select(`#${containerId} svg`), `Annual hospitalisation trends for ${selectedRoadUser} in ${selectedState}.`);

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

    // --- X axis: always rotate labels to -45° ---------------------
    // Rotating keeps the 11 year labels legible at every width,
    // and prevents the labels from colliding with the shaded break bands.
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0,${height})`);

    const stepWidth = width / Math.max(1, years.length - 1);

    // Slightly larger font on wide screens, smaller on narrow ones.

    xAxisGroup
        .call(d3.axisBottom(x).tickFormat(formatYear))
        .style("font-family", "Poppins")
        .style("color", COLORS.muted);

    // Always rotate the tick labels
    xAxisGroup
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-0.4em")
        .attr("dy", "0.4em");


    // --- Y axis ---------------------------------------------------
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(formatNumber))
        .style("font-family", "Poppins").style("font-size", "10px").style("color", COLORS.muted);

    // 5. Color Scale
    const jurisdictions = [...new Set(filteredData.map(d => d.jurisdiction))].sort();
    const colorScale = d3.scaleOrdinal()
        .domain(jurisdictions)
        .range(["#0072B2", "#D55E00", "#009E73", "#E69F00", "#CC79A7", "#56B4E9", "#F0E442", "#999999"]);

    // 6. Line Generator
    const line = d3.line()
        .defined(d => d.hospitalisations !== null)
        .x(d => x(d.year))
        .y(d => y(d.hospitalisations));

    const groupedData = d3.group(filteredData, d => d.jurisdiction);

    // 7. Draw Lines
    groupedData.forEach((values, jurisdiction) => {
        svg.append("path")
            .datum(values.sort((a, b) => a.year - b.year))
            .attr("fill", "none")
            .attr("stroke", colorScale(jurisdiction))
            .attr("stroke-width", 2)
            .attr("d", line);
    });

    const markerAriaLabel = (d) =>
        `${d.jurisdiction}, year ${d.year}: ${formatNumber(d.hospitalisations)} hospitalisations`;

    // 8. Draw data point markers
    const markers = svg.selectAll(".marker")
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

    // 9. Data Quality Breaks
    const breakYears = [2012, 2017];
    const bandWidth = x.step() * 0.5 || 20;

    breakYears.forEach(year => {
        if (x(year)) {
            svg.append("rect")
                .attr("x", x(year) - bandWidth / 2)
                .attr("y", 0)
                .attr("width", bandWidth)
                .attr("height", height)
                .attr("fill", "#bbbdbf")
                .attr("opacity", 0.5)
                .attr("aria-hidden", "true")
                .style("pointer-events", "none");

            svg.append("text")
                .attr("x", x(year))
                .attr("y", -5)
                .attr("text-anchor", "middle")
                .attr("aria-hidden", "true")
                .text(year === 2012 ? "Vic break" : "NSW break")
                .style("font-family", "Poppins")
                .style("font-size", "9px")
                .style("fill", COLORS.warning)
                .style("font-weight", "bold");
        }
    });

    // 10. Shared tooltip
    attachTooltip(markers, (d) => ({
        title: d.jurisdiction,
        lines: [
            `Year: ${d.year}`,
            `Hospitalisations: ${formatNumber(d.hospitalisations)}`
        ],
        context: `Annual hospitalisations, ${d.year}`
    }));

    // -----------------------------------------------------------------
    // Roving tabindex: Left/Right walk every point chronologically,
    // Up/Down jump by jurisdiction at the current year.
    // -----------------------------------------------------------------
    const orderedPoints = filteredData
        .slice()
        .sort((a, b) =>
            a.year - b.year || a.jurisdiction.localeCompare(b.jurisdiction)
        );

    const orderIndex = new Map();
    orderedPoints.forEach((d, i) => {
        orderIndex.set(`${d.jurisdiction}|${d.year}`, i);
    });

    const markerByKey = new Map();
    markers.each(function (d) {
        markerByKey.set(`${d.jurisdiction}|${d.year}`, this);
    });

    const jurIndex = new Map(jurisdictions.map((j, i) => [j, i]));
    const allMarkerNodes = markers.nodes();

    allMarkerNodes.forEach((n) => n.setAttribute("tabindex", "-1"));
    if (orderedPoints.length > 0) {
        const firstKey = `${orderedPoints[0].jurisdiction}|${orderedPoints[0].year}`;
        const firstNode = markerByKey.get(firstKey);
        if (firstNode) firstNode.setAttribute("tabindex", "0");
    }

    function focusMarker(node) {
        if (!node) return;
        allMarkerNodes.forEach((n) => n.setAttribute("tabindex", "-1"));
        node.setAttribute("tabindex", "0");
        node.focus();
    }

    markers.on("keydown.nav", function (event, d) {
        const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
        if (!keys.includes(event.key)) return;

        event.preventDefault();

        const key = `${d.jurisdiction}|${d.year}`;
        const idx = orderIndex.get(key);
        if (idx == null) return;

        let targetNode = null;

        if (event.key === "ArrowRight") {
            const next = orderedPoints[idx + 1];
            if (next) targetNode = markerByKey.get(`${next.jurisdiction}|${next.year}`);
        } else if (event.key === "ArrowLeft") {
            const prev = orderedPoints[idx - 1];
            if (prev) targetNode = markerByKey.get(`${prev.jurisdiction}|${prev.year}`);
        } else if (event.key === "ArrowDown") {
            const currentJurIdx = jurIndex.get(d.jurisdiction);
            for (let j = currentJurIdx + 1; j < jurisdictions.length; j++) {
                const candidateKey = `${jurisdictions[j]}|${d.year}`;
                if (markerByKey.has(candidateKey)) {
                    targetNode = markerByKey.get(candidateKey);
                    break;
                }
            }
        } else if (event.key === "ArrowUp") {
            const currentJurIdx = jurIndex.get(d.jurisdiction);
            for (let j = currentJurIdx - 1; j >= 0; j--) {
                const candidateKey = `${jurisdictions[j]}|${d.year}`;
                if (markerByKey.has(candidateKey)) {
                    targetNode = markerByKey.get(candidateKey);
                    break;
                }
            }
        } else if (event.key === "Home") {
            const first = orderedPoints[0];
            if (first) targetNode = markerByKey.get(`${first.jurisdiction}|${first.year}`);
        } else if (event.key === "End") {
            const last = orderedPoints[orderedPoints.length - 1];
            if (last) targetNode = markerByKey.get(`${last.jurisdiction}|${last.year}`);
        }

        if (targetNode) focusMarker(targetNode);
    });

    // --- Legend ---
    let legendGroup;
    if (isMobile) {
        legendGroup = svg.append("g")
            .attr("transform", `translate(5, ${height + 40})`);
    } else {
        legendGroup = svg.append("g")
            .attr("transform", `translate(${width + 20}, 10)`);
    }

    let itemsPerRow;
    if (isVerySmall) {
        itemsPerRow = 3;
    } else if (isMobile) {
        itemsPerRow = 4;
    } else {
        itemsPerRow = 2;
    }

    jurisdictions.forEach((jurisdiction, i) => {
        let xOffset, yOffset;

        if (isMobile) {
            const spacing = isVerySmall ? 65 : 70;
            xOffset = (i % itemsPerRow) * spacing;
            yOffset = Math.floor(i / itemsPerRow) * 20;
        } else {
            const itemsPerCol = Math.ceil(jurisdictions.length / 2);
            const col = Math.floor(i / itemsPerCol);
            const row = i % itemsPerCol;
            xOffset = col * 60;
            yOffset = row * 20;
        }

        const legendRow = legendGroup.append("g")
            .attr("transform", `translate(${xOffset}, ${yOffset})`);

        legendRow.append("rect")
            .attr("x", 0).attr("y", 0)
            .attr("width", isVerySmall ? 10 : 12)
            .attr("height", isVerySmall ? 10 : 12)
            .attr("fill", colorScale(jurisdiction))
            .attr("aria-hidden", "true");

        legendRow.append("text")
            .attr("x", isVerySmall ? 14 : 18)
            .attr("y", isVerySmall ? 9 : 10)
            .text(jurisdiction)
            .style("font-family", "Poppins")
            .style("font-size", isVerySmall ? "9px" : "11px")
            .style("fill", COLORS.text)
            .style("alignment-baseline", "middle")
            .attr("aria-hidden", "true");
    });
}