// js/charts/state_territory/lineChart.js
import { COLORS } from '../../config.js';
import { formatNumber, formatYear } from '../../utils/formatters.js';
import { addAriaLabel } from '../../utils/accessibility.js';

const announce = (text) => {
    const announcer = document.getElementById("sr-announcer");
    if (announcer) announcer.textContent = text;
};

export function drawStateLineChart(data, containerId, selectedRoadUser = "All", selectedState = "All") {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Check screen sizes
    const isMobile = window.innerWidth < 768;
    const isVerySmall = window.innerWidth < 480;

    // 2. Adjust margins
    let margin;
    if (isVerySmall) {
        margin = { top: 20, right: 20, bottom: 120, left: 50 };
    } else if (isMobile) {
        margin = { top: 20, right: 20, bottom: 90, left: 60 };
    } else {
        margin = { top: 20, right: 200, bottom: 40, left: 60 };
    }

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

    // 4. Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(formatYear))
        .style("font-family", "Poppins").style("font-size", "10px").style("color", COLORS.muted);

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
        .style("cursor", "pointer")
        .attr("role", "img")
        .attr("aria-label", markerAriaLabel);

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

    // 10. Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "line-tooltip")
        .style("opacity", 0).style("position", "absolute").style("background", COLORS.text)
        .style("color", "#fff").style("padding", "5px 10px").style("border-radius", "5px")
        .style("font-size", "12px").style("pointer-events", "none").style("z-index", "1000");

    const showMarkerTooltip = (event, d, el) => {
        d3.select(el).attr("r", 6);
        tooltip.style("opacity", 1)
            .html(`<strong>${d.jurisdiction}</strong><br>Year: ${d.year}<br>Hospitalisations: ${formatNumber(d.hospitalisations)}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    };

    const hideMarkerTooltip = (el) => {
        d3.select(el).attr("r", 3.5);
        tooltip.style("opacity", 0);
    };

    markers
        .on("mouseover", function (event, d) { showMarkerTooltip(event, d, this); })
        .on("mouseout", function () { hideMarkerTooltip(this); })
        .on("focus", function (event, d) {
            const bounds = this.getBoundingClientRect();
            showMarkerTooltip(
                { pageX: bounds.right + window.scrollX, pageY: bounds.top + window.scrollY },
                d,
                this
            );
            announce(markerAriaLabel(d));
        })
        .on("blur", function () {
            hideMarkerTooltip(this);
            announce("");
        });

    // -----------------------------------------------------------------
    // Roving tabindex for the line chart
    //
    // Left / Right  → previous / next data point in chronological order
    //                 (walks across ALL jurisdictions, so no one gets stuck)
    // Up / Down     → same year, previous / next jurisdiction
    //                 (skips jurisdictions with no data for that year)
    // Home / End    → first / last data point in the whole timeline
    // -----------------------------------------------------------------

    // Chronologically ordered list of every point (year, then jurisdiction)
    const orderedPoints = filteredData
        .slice()
        .sort((a, b) =>
            a.year - b.year || a.jurisdiction.localeCompare(b.jurisdiction)
        );

    // Lookup index by "jurisdiction|year"
    const orderIndex = new Map();
    orderedPoints.forEach((d, i) => {
        orderIndex.set(`${d.jurisdiction}|${d.year}`, i);
    });

    // Lookup DOM node by "jurisdiction|year"
    const markerByKey = new Map();
    markers.each(function (d) {
        markerByKey.set(`${d.jurisdiction}|${d.year}`, this);
    });

    // Index jurisdictions so we can walk them in sorted order
    const jurIndex = new Map(jurisdictions.map((j, i) => [j, i]));

    // Collect all marker nodes so we can reset tabindexes in bulk
    const allMarkerNodes = markers.nodes();

    // Start with only the first chronological marker tabbable
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
            // Next point in chronological order
            const next = orderedPoints[idx + 1];
            if (next) targetNode = markerByKey.get(`${next.jurisdiction}|${next.year}`);

        } else if (event.key === "ArrowLeft") {
            // Previous point in chronological order
            const prev = orderedPoints[idx - 1];
            if (prev) targetNode = markerByKey.get(`${prev.jurisdiction}|${prev.year}`);

        } else if (event.key === "ArrowDown") {
            // Same year, next jurisdiction that has data
            const currentJurIdx = jurIndex.get(d.jurisdiction);
            for (let j = currentJurIdx + 1; j < jurisdictions.length; j++) {
                const candidateKey = `${jurisdictions[j]}|${d.year}`;
                if (markerByKey.has(candidateKey)) {
                    targetNode = markerByKey.get(candidateKey);
                    break;
                }
            }

        } else if (event.key === "ArrowUp") {
            // Same year, previous jurisdiction that has data
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