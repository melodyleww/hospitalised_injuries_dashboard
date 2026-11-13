// js/utils/tooltip.js
function getTooltip() {
  return document.getElementById("fnTooltip");
}

// --- Screen Reader Live Region ---
// GenAI Acknowledgement: I asked Deepseek AI how to make D3 SVG charts accessible 
// to screen readers. The AI explained that SVG shapes cannot be read directly, 
// so I needed to update an aria-live region on focus. I used the suggested 
// pattern of clearing the region first (textContent = "") and then setting 
// the new value, to ensure the screen reader announces every change.
function announce(text) {
  const announcer = document.getElementById("sr-announcer");
  if (announcer) announcer.textContent = text;
}

export function hideTooltip() {
  getTooltip().hidden = true;
  announce("");
}

// Keep the tooltip inside the browser window
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
    .attr("tabindex", 0)
    .attr("role", "img")
    .attr("aria-label", (datum) => {
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