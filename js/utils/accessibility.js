// js/utils/accessibility.js

export function addAriaLabel(svgSelection, labelText) {
    svgSelection
        .attr("role", "img")
        .attr("aria-label", labelText);
}