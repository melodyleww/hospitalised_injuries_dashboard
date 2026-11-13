// This file builds the shared header, navigation tabs, footer, and "How to use" dialog
// that appear on every page

// Different page footer settings: note and help text used by the shared layout
const pageSettings = {
  national: {
    note: "Counts are not adjusted for population size.",
    help: "Choose a year or road-user group to explore the national charts.",
  },
  state: {
    note: "Grey hatched areas or gaps in lines indicate suppressed data (<em>n.p.</em>). These are missing values, not zeros, and are handled this way to protect privacy.",
    help: "Use the available filters to compare states and territories.",
  },
  firstNations: {
    note: "Counts and within-population percentages are not population injury rates.",
    help: "Choose a year and population. Missing values are not zero.",
  },
  about: {
    note: "Read definitions and limitations before interpreting comparisons.",
    help: "Choose a topic to read about its data, measures and limitations.",
  },
};

// Builds the shared header, nav, footer and dialog into the page
function renderSharedLayout() {
  // Read which page we're on from <body data-page="...">
  const page = document.body.dataset.page;
  const settings = pageSettings[page];

  if (!settings) {
    throw new Error("Unknown dashboard page: " + page);
  }

  document.getElementById("site-header").innerHTML = `
        <div class="brand">
            <span class="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none"
                     stroke="currentColor" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 21V8l9-5 9 5v13" />
                    <path d="M12 9v6" />
                    <path d="M9 12h6" />
                    <path d="M3 21h18" />
                </svg>
            </span>
            <div class="brand-text">
                <span class="brand-title">Hospitalised Injuries</span>
                <span class="brand-subtitle">Road crashes in Australia · 2011–2021</span>
            </div>
        </div>
        <button
            id="sharedHelpButton"
            class="how-to-use"
            type="button"
            aria-label="Open the how-to-use walkthrough">
            <span class="help-icon" aria-hidden="true">ⓘ</span>
            <span class="help-text">How to use</span>
        </button>
    `;

  // Navigation tabs (one per dashboard page)
  const links = [
    { id: "national", label: "National Overview", href: "index.html" },
    { id: "state", label: "State Comparisons", href: "state-comparisons.html" },
    {
      id: "firstNations",
      label: "Population Comparison",
      href: "first-nations.html",
    },
    {
      id: "about",
      label: "About the Data",
      href: "about-data.html",
    },
  ];

  // Build the nav <ul>, marking the current page as active
  document.getElementById("site-navigation").innerHTML = `
        <ul class="tabs">
            ${links
              .map(
                (link) => `
                <li>
                    <a
                        class="tab ${link.id === page ? "active" : ""}"
                        href="${link.href}"
                        ${link.id === page ? 'aria-current="page"' : ""}>
                        ${link.label}
                    </a>
                </li>
            `,
              )
              .join("")}
        </ul>
    `;

  const footer = document.getElementById("site-footer");

  // Footer shows the data source + the note for this page
  footer.innerHTML = `
        <p>Data Source: BITRE / AIHW | ${settings.note}</p>
    `;

  // --- REDIRECT LOGIC FOR "HOW TO USE" BUTTON ---
  document.getElementById("sharedHelpButton").addEventListener("click", (e) => {
    if (page !== "national") {
      // If on another page, redirect to national and trigger walkthrough
      e.preventDefault();
      window.location.href = "index.html?walkthrough=true";
    }
    // If on the national page, walkthrough.js handles it naturally
  });
}

renderSharedLayout();
