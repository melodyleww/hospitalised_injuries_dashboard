// js/utils/accessibility.js

export function addAriaLabel(svgSelection, labelText) {
    svgSelection
        .attr("role", "img")
        .attr("aria-label", labelText);
}

// Any of opts can be omitted; the helper falls back to linear order
// (Left/Up = previous, Right/Down = next, in DOM order).
export function enableGridNavigation(selection, opts = {}) {
    const nodes = selection.nodes();
    if (!nodes.length) return;

    // Start with only the first node tabbable
    nodes.forEach((n, i) => n.setAttribute("tabindex", i === 0 ? "0" : "-1"));

    function focusNode(node) {
        if (!node) return;
        // Demote all, promote the target
        nodes.forEach(n => n.setAttribute("tabindex", "-1"));
        node.setAttribute("tabindex", "0");
        node.focus();
    }

    // Determine the visual grid if cols/rows supplied, else linear.
    const cols = typeof opts.cols === "function" ? opts.cols : (d, i) => i;
    const rows = typeof opts.rows === "function" ? opts.rows : () => 0;
    const colCount = opts.colCount ?? nodes.length;
    const rowCount = opts.rowCount ?? 1;

    // Build index by (row, col) for grid lookups
    const dataByCell = new Map();
    selection.each(function (d, i) {
        const r = rows(d, i);
        const c = cols(d, i);
        dataByCell.set(`${r},${c}`, this);
    });

    const findByRowCol = (r, c) => dataByCell.get(`${r},${c}`) || null;

    selection.on("keydown.nav", function (event, d) {
        if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

        event.preventDefault();
        const currentIndex = nodes.indexOf(this);
        let target = null;

        if (opts.cols && opts.rows) {
            const r = rows(d, currentIndex);
            const c = cols(d, currentIndex);

            switch (event.key) {
                case "ArrowRight": target = findByRowCol(r, c + 1); break;
                case "ArrowLeft":  target = findByRowCol(r, c - 1); break;
                case "ArrowDown":  target = findByRowCol(r + 1, c); break;
                case "ArrowUp":    target = findByRowCol(r - 1, c); break;
                case "Home":       target = findByRowCol(r, 0); break;
                case "End":        target = findByRowCol(r, colCount - 1); break;
            }
        } else {
            // Fallback: linear order
            switch (event.key) {
                case "ArrowRight":
                case "ArrowDown": target = nodes[currentIndex + 1]; break;
                case "ArrowLeft":
                case "ArrowUp":   target = nodes[currentIndex - 1]; break;
                case "Home":      target = nodes[0]; break;
                case "End":       target = nodes[nodes.length - 1]; break;
            }
        }

        if (target) focusNode(target);
    });
}