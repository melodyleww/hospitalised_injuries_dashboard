// This file provides accessibility helpers: adding ARIA labels to SVGs and
// enabling keyboard (arrow-key) navigation between focusable chart marks

// GenAI Acknowledgement (state_territory [Chok Li En]): 
// The overall structure of the `enableGridNavigation` function, including the 
// roving tabindex pattern (setting one tabindex=0 and the rest to -1), was drafted 
// with the help of Deepseek AI. 
// I significantly modified the solution to support custom row/column mapping, 
// allowing it to handle 1D lists (bar charts) and 2D grids (heatmaps).

// --- GenAI Acknowledgment (nation [Eva]) ---
// The enableGridNavigation function, including the arrow-key/Home/End keyboard
// navigation logic and the grid-vs-linear fallback lookup, was generated with
// the assistance of a large language model

// Adds role="img" and an aria-label to an SVG selection
export function addAriaLabel(svgSelection, labelText) {
  svgSelection.attr("role", "img").attr("aria-label", labelText);
}

// Any of opts can be omitted; the helper falls back to linear order
// (Left/Up = previous, Right/Down = next, in DOM order)
export function enableGridNavigation(selection, opts = {}) {
  const nodes = selection.nodes();
  if (!nodes.length) return;

  // Start with only the first node tabbable
  nodes.forEach((n, i) => n.setAttribute("tabindex", i === 0 ? "0" : "-1"));

  function focusNode(node) {
    if (!node) return;
    // Demote all, promote the target
    nodes.forEach((n) => n.setAttribute("tabindex", "-1"));
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

  // Handle arrow keys / Home / End to move focus
  selection.on("keydown.nav", function (event, d) {
    if (
      ![
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ].includes(event.key)
    )
      return;

    event.preventDefault();
    const currentIndex = nodes.indexOf(this);
    let target = null;

    if (opts.cols && opts.rows) {
      const r = rows(d, currentIndex);
      const c = cols(d, currentIndex);

      switch (event.key) {
        case "ArrowRight":
          target = findByRowCol(r, c + 1);
          break;
        case "ArrowLeft":
          target = findByRowCol(r, c - 1);
          break;
        case "ArrowDown":
          target = findByRowCol(r + 1, c);
          break;
        case "ArrowUp":
          target = findByRowCol(r - 1, c);
          break;
        case "Home":
          target = findByRowCol(r, 0);
          break;
        case "End":
          target = findByRowCol(r, colCount - 1);
          break;
      }
    } else {
      // Fallback: linear order
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          target = nodes[currentIndex + 1];
          break;
        case "ArrowLeft":
        case "ArrowUp":
          target = nodes[currentIndex - 1];
          break;
        case "Home":
          target = nodes[0];
          break;
        case "End":
          target = nodes[nodes.length - 1];
          break;
      }
    }

    if (target) focusNode(target);
  });
}
