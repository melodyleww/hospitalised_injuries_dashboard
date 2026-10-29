//floating tooltip shared by the First Nations charts
function getTooltip() {
  return document.getElementById("fnTooltip");
}

export function hideTooltip() {
  getTooltip().hidden = true;
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

    // Clear elements AND plain text from the previous chart
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
