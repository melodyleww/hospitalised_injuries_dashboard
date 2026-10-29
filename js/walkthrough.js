// js/walkthrough.js

// --- GenAI Acknowledgment ---
// The walkthrough logic, including the localStorage check to show it only once,
// was generated with the assistance of a large language model.
// ---

document.addEventListener("DOMContentLoaded", () => {
    // Only run on the National page
    if (document.body.dataset.page !== "national") return;

    // Wait for layout.js to inject the header and nav elements
    setTimeout(() => {
        const overlay = document.getElementById("walkthroughOverlay");
        const tabHighlight = document.getElementById("walkthroughTabHighlight");
        const dialog = document.getElementById("walkthroughDialog");
        const title = document.getElementById("walkthroughTitle");
        const text = document.getElementById("walkthroughText");
        const btnPrev = document.getElementById("walkthroughPrev");
        const btnNext = document.getElementById("walkthroughNext");
        const btnSkip = document.getElementById("walkthroughSkip");

        if (!dialog) return;

        const steps = [
            { title: "Step 1/5", text: "Use the filters to explore three connected views: the National Overview (the big picture), State Comparisons (where injuries happen), and First Nations (who is most affected).", targetId: ".tabs" },
            { title: "Step 2/5", text: "You'll find the data dictionary, glossary, and important notes on data quality, privacy suppression, and time-series breaks to help you interpret the charts correctly.", targetId: "aboutTab" },
            { title: "Step 3/5", text: "Use the dropdowns to narrow down the data, then click Apply to update the charts or click Reset to clear all filters and start over.", targetId: "yearFilter" },
            { title: "Step 4/5", text: "Click any bar in the bar chart or slice in the pie chart to instantly cross-filter the entire dashboard.", targetId: "roadUserChart" },
            { title: "Step 5/5", text: "Forgot how to use the dashboard? You can click this button anytime to replay this guide.", targetId: "sharedHelpButton" }
        ];

        let currentStep = 0;

        function updateStep() {
            const step = steps[currentStep];
            title.innerText = step.title;
            text.innerText = step.text;
            btnPrev.style.display = currentStep === 0 ? "none" : "block";
            btnNext.innerText = currentStep === steps.length - 1 ? "Start exploring" : "Next";
            positionWalkthrough(step.targetId);
        }

        function positionWalkthrough(targetId) {
            dialog.style.top = "50%"; dialog.style.left = "50%"; dialog.style.transform = "translate(-50%, -50%)"; dialog.style.right = "auto";
            tabHighlight.style.display = "none";

            if (targetId === ".tabs") {
                const tabsList = document.querySelectorAll(".tabs li a");
                if (tabsList.length < 3) return;
                const firstTab = tabsList[0].getBoundingClientRect();
                const lastTab = tabsList[2].getBoundingClientRect();
                tabHighlight.style.display = "block";
                tabHighlight.style.top = `${firstTab.top - 6}px`; tabHighlight.style.left = `${firstTab.left - 6}px`; tabHighlight.style.width = `${(lastTab.right - firstTab.left) + 12}px`; tabHighlight.style.height = `${firstTab.height + 12}px`;
                dialog.style.top = `${firstTab.bottom + 25}px`; dialog.style.left = "50%"; dialog.style.transform = "translateX(-50%)";
            }
            else if (targetId === "aboutTab") {
                const tabsList = document.querySelectorAll(".tabs li a");
                if (tabsList.length < 4) return;
                const aboutTab = tabsList[3].getBoundingClientRect();
                tabHighlight.style.display = "block";
                tabHighlight.style.top = `${aboutTab.top - 6}px`; tabHighlight.style.left = `${aboutTab.left - 6}px`; tabHighlight.style.width = `${aboutTab.width + 12}px`; tabHighlight.style.height = `${aboutTab.height + 12}px`;
                dialog.style.top = `${aboutTab.bottom + 25}px`; dialog.style.left = "50%"; dialog.style.transform = "translateX(-50%)";
            }
            else if (targetId === "yearFilter") {
                const filterBar = document.querySelector(".filter-bar");
                if (!filterBar) return;
                const rect = filterBar.getBoundingClientRect();
                tabHighlight.style.display = "block";
                tabHighlight.style.top = `${rect.top - 6}px`; tabHighlight.style.left = `${rect.left - 6}px`; tabHighlight.style.width = `${rect.width + 12}px`; tabHighlight.style.height = `${rect.height + 12}px`;
                dialog.style.top = `${rect.bottom + 25}px`; dialog.style.left = "50%"; dialog.style.transform = "translateX(-50%)";
            }
            else if (targetId === "roadUserChart") {
                const chartCard = document.querySelector(".road-user-card");
                if (!chartCard) return;
                const rect = chartCard.getBoundingClientRect();
                const dialogWidth = 411; const dialogHeight = 215; const gap = 20;
                tabHighlight.style.display = "block";
                tabHighlight.style.top = `${rect.top - 6}px`; tabHighlight.style.left = `${rect.left - 6}px`; tabHighlight.style.width = `${rect.width + 12}px`; tabHighlight.style.height = `${rect.height + 12}px`;

                if (rect.right + gap + dialogWidth <= window.innerWidth) {
                    dialog.style.top = "50%"; dialog.style.left = `${rect.right + gap}px`; dialog.style.transform = "translateY(-50%)";
                } else if (rect.top - gap - dialogHeight >= 0) {
                    dialog.style.top = `${rect.top - gap - dialogHeight}px`; dialog.style.left = "50%"; dialog.style.transform = "translateX(-50%)";
                } else {
                    dialog.style.top = `${rect.bottom + gap}px`; dialog.style.left = "50%"; dialog.style.transform = "translateX(-50%)";
                }
            }
            else if (targetId === "sharedHelpButton") {
                const helpButton = document.getElementById("sharedHelpButton");
                if (!helpButton) return;
                const rect = helpButton.getBoundingClientRect();
                const gap = 15;
                tabHighlight.style.display = "block";
                tabHighlight.style.top = `${rect.top - 6}px`; tabHighlight.style.left = `${rect.left - 6}px`; tabHighlight.style.width = `${rect.width + 12}px`; tabHighlight.style.height = `${rect.height + 12}px`;
                dialog.style.top = `${rect.bottom + gap}px`; dialog.style.left = "auto"; dialog.style.right = "20px"; dialog.style.transform = "none";
            }
            else {
                dialog.style.top = "50%"; dialog.style.left = "50%"; dialog.style.transform = "translate(-50%, -50%)";
            }
        }

        function startWalkthrough() {
            currentStep = 0;
            updateStep();
            overlay.style.display = "block";
            if (!dialog.open) dialog.showModal();
        }

        function endWalkthrough() {
            overlay.style.display = "none";
            tabHighlight.style.display = "none";
            dialog.close();
            // Mark the walkthrough as completed in localStorage
            localStorage.setItem("walkthroughCompleted", "true");
        }

        btnNext.addEventListener("click", () => {
            if (currentStep < steps.length - 1) {
                currentStep++;
                updateStep();
            } else {
                endWalkthrough();
            }
        });

        btnPrev.addEventListener("click", () => {
            if (currentStep > 0) {
                currentStep--;
                updateStep();
            }
        });

        btnSkip.addEventListener("click", endWalkthrough);

        // Check if the user has already completed the walkthrough
        const walkthroughCompleted = localStorage.getItem("walkthroughCompleted");

        if (walkthroughCompleted !== "true") {
            // Only auto-start if not completed before
            const urlParams = new URLSearchParams(window.location.search);
            const shouldAutoStart = urlParams.get('walkthrough') === 'true';
            if (shouldAutoStart) {
                window.history.replaceState({}, document.title, window.location.pathname);
                setTimeout(startWalkthrough, 300);
            } else {
                setTimeout(startWalkthrough, 800);
            }
        }

        document.body.addEventListener("click", (e) => {
            if (e.target.closest("#sharedHelpButton")) {
                e.preventDefault();
                // Manually reset the step and start
                startWalkthrough();
            }
        });

        window.addEventListener("resize", () => {
            if (dialog.open) {
                positionWalkthrough(steps[currentStep].targetId);
            }
        });

    }, 150);
});