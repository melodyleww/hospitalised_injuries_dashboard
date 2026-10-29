// js/components/layout.js
const pageSettings = {
  national: {
    note: "Counts are not adjusted for population size.",
    help: "Choose a year or road-user group to explore the national charts.",
  },
  state: {
    note: "Read chart labels to distinguish counts from population rates.",
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

function renderSharedLayout() {
  const page = document.body.dataset.page;
  const settings = pageSettings[page];

  if (!settings) {
    throw new Error("Unknown dashboard page: " + page);
  }

  document.getElementById("site-header").innerHTML = `
        <h1>
            Hospitalised Injuries from Road Crashes
            in Australia (2011–2021)
        </h1>
        <button
            id="sharedHelpButton"
            class="how-to-use"
            type="button">
            ⓘ How to use?
        </button>
    `;

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

  footer.innerHTML = `
        <p>Data Source: BITRE / AIHW | ${settings.note}</p>
        <p class="icon-credits">
            Icons by
            <a href="https://www.flaticon.com/authors/magnific"
               target="_blank" rel="noopener noreferrer">Magnific</a>
            from
            <a href="https://www.flaticon.com/"
               target="_blank" rel="noopener noreferrer">Flaticon</a>
        </p>
    `;

  // Shared dialog: opened above the dashboard without changing its layout.
  const dialog = document.createElement("dialog");
  dialog.className = "shared-dialog";
  dialog.setAttribute("aria-labelledby", "sharedDialogTitle");

  dialog.innerHTML = `
        <h2 id="sharedDialogTitle"></h2>
        <p id="sharedDialogText"></p>
        <form method="dialog">
            <button type="submit" class="btn btn-apply">Close</button>
        </form>
    `;

  document.body.append(dialog);

  function openDialog(title, text) {
    document.getElementById("sharedDialogTitle").textContent = title;
    document.getElementById("sharedDialogText").textContent = text;
    dialog.showModal();
  }
  // --- REMOVED the sharedHelpButton event listener here ---
  // The walkthrough.js will handle the "How to use" button click

    // Handle "How to use" button click
    document.getElementById("sharedHelpButton")
        .addEventListener("click", (e) => {
            if (page !== "national") {
                // If on another page, redirect to national and trigger walkthrough
                e.preventDefault();
                window.location.href = "index.html?walkthrough=true";
            }
            // If on national page, the walkthrough.js handles the click naturally
        });

    // Handle "About" button click
    document.getElementById("sharedAboutButton")
        .addEventListener("click", () => {
            let aboutText = "";
            if (page === "state") {
                aboutText = "Compare hospitalisation trends, road-user composition, and age patterns across Australian states and territories. " +
                    "Raw counts show total volume. The 'Rate per 100k' toggle accounts for population size using a 2021 snapshot (2021 hospitalisations ÷ ABS 2021 Census population × 100,000). " +
                    "Note: Rates do not account for travel volumes. Admission-policy changes in Vic (2012) and NSW (2017) affect trends. " +
                    "The assignment brief states, 'You are not required to normalise this data to pass this assessment.' This rate comparison is an additional way to account for population differences.";
            } else if (page === "firstNations") {
                aboutText = "This dashboard compares hospitalisation patterns between First Nations peoples and non-Indigenous Australians. " +
                    "Counts and within-population percentages are shown, but these are not direct population injury rates. " +
                    "Missing values are not zero; they represent suppressed or unavailable data due to privacy and data quality protocols.";
            } else {
                aboutText = "BITRE’s September 2023 release uses AIHW hospital data for 2011–2021. Figures describe hospitalisation cases, not unique people or crashes. Admission-policy changes and unpublished values affect some comparisons.";
            }
            openDialog("About the data", aboutText);
        });
  document.getElementById("sharedAboutButton").addEventListener("click", () => {
    openDialog(
      "About the data",
      "BITRE’s September 2023 release uses AIHW hospital data " +
        "for 2011–2021. Figures describe hospitalisation cases, " +
        "not unique people or crashes. Admission-policy changes " +
        "and unpublished values affect some comparisons.",
    );
  });
}

renderSharedLayout();
