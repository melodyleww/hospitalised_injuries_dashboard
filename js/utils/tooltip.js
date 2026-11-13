// This file manages the shared chart tooltip: showing/hiding it, positioning it
// near the pointer or focused mark, and announcing content to screen readers

// Get the shared tooltip element
function getTooltip() {
  return document.getElementById("fnTooltip");
}

// --- GenAI Acknowledgment ---
// The announce() helper below, which sends tooltip text to the
// #sr-announcer live region so screen readers can read it, was written
// with help from a large language model

// Send text to the visually-hidden live region for screen readers
function announce(text) {
  const announcer = document.getElementById("sr-announcer");
  if (announcer) announcer.textContent = text;
}

// Hide the tooltip and clear the announcement
export function hideTooltip() {
  getTooltip().hidden = true;
  announce("");
}

// Keep the tooltip inside the browser window
// Positions the tooltip near the pointer (mouse) or mark (focus)
function positionTooltip(event) {
  const tooltip = getTooltip();
  const bounds = event.currentTarget.getBoundingClientRect();

  const keyboard = event.type === "focus";
  const x = keyboard ? bounds.right : event.clientX;
  const y = keyboard ? bounds.top : event.clientY;

  const left = Math.max(
    12,
    Math.min(x + 12, window.innerWidth - tooltip.offsetWidth - 12),
  );

  const top = Math.max(
    12,
    Math.min(y + 12, window.innerHeight - tooltip.offsetHeight - 12),
  );

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

// Each chart provides its title, detail lines and accessible context
export function attachTooltip(marks, getContent) {
  // Build tooltip content, position it, and announce it
  function showTooltip(event, datum) {
    const tooltip = getTooltip();
    const content = getContent(datum);

    tooltip.replaceChildren();

    const heading = document.createElement("strong");
    heading.textContent = content.title;
    tooltip.append(heading);

    content.lines.forEach((line) => {
      const detail = document.createElement("div");
      detail.textContent = line;
      tooltip.append(detail);
    });

    tooltip.hidden = false;
    positionTooltip(event);

    // Announce the full accessible text to screen readers
    const accessible = [content.context, content.title, ...content.lines]
      .filter(Boolean)
      .join(". ");
    announce(accessible);
  }

  marks
    .classed("fn-interactive-mark", true)
    .attr("tabindex", 0) //focusable via keyboard
    .attr("role", "img")
    .attr("aria-label", (datum) => {
      // Full accessible description for each mark
      const content = getContent(datum);
      return [content.context, content.title, ...content.lines]
        .filter(Boolean)
        .join(". ");
    })
    .on("mouseenter.tooltip", showTooltip)
    .on("mousemove.tooltip", positionTooltip)
    .on("mouseleave.tooltip", hideTooltip)
    .on("focus.tooltip", showTooltip)
    .on("blur.tooltip", hideTooltip)
    .on("keydown.tooltip", (event) => {
      if (event.key === "Escape") {
        hideTooltip();
      }
    });
}
