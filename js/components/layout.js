//shared page structure
const pageSettings = {
    national: {
        note: "Counts are not adjusted for population size.",
        help: "Choose a year or road-user group to explore the national charts."
    },
    state: {
        note: "Read chart labels to distinguish counts from population rates.",
        help: "Use the available filters to compare states and territories."
    },
    firstNations: {
        note: "Counts and within-population percentages are not population injury rates.",
        help: "Choose a year and population. Missing values are not zero."
    }
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
        { id: "firstNations", label: "First Nations", href: "first-nations.html" }
    ];

    document.getElementById("site-navigation").innerHTML = `
        <ul class="tabs">
            ${links.map(link => `
                <li>
                    <a
                        class="tab ${link.id === page ? "active" : ""}"
                        href="${link.href}"
                        ${link.id === page ? 'aria-current="page"' : ""}>
                        ${link.label}
                    </a>
                </li>
            `).join("")}
            <li>
                <button id="sharedAboutButton" class="tab" type="button">
                    About the Data
                </button>
            </li>
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

    document.getElementById("sharedHelpButton")
        .addEventListener("click", () => {
            openDialog("How to use", settings.help);
        });

    document.getElementById("sharedAboutButton")
        .addEventListener("click", () => {
            openDialog(
                "About the data",
                "BITRE’s September 2023 release uses AIHW hospital data " +
                "for 2011–2021. Figures describe hospitalisation cases, " +
                "not unique people or crashes. Admission-policy changes " +
                "and unpublished values affect some comparisons."
            );
        });
}

renderSharedLayout();