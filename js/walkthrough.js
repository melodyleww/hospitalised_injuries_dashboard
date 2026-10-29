// js/walkthrough.js
document.addEventListener("DOMContentLoaded", () => {
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
        {
            title: "Step 1/5",
            text: "Use the filters to explore three connected views: the National Overview (the big picture), State Comparisons (where injuries happen), and First Nations (who is most affected).",
            targetId: ".tabs"
        },
        {
            title: "Step 2/5",
            text: "You'll find the data dictionary, glossary, and important notes on data quality, privacy suppression, and time-series breaks to help you interpret the charts correctly.",
            targetId: "sharedAboutButton"
        },
        {
            title: "Step 3/5",
            text: "Use the dropdowns to narrow down the data, then click Apply to update the charts or click Reset to clear all filters and start over.",
            targetId: "yearFilter"
        },
        {
            title: "Step 4/5",
            text: "Click any bar in the bar chart or slice in the pie chart to instantly cross-filter the entire dashboard.",
            targetId: "roadUserChart"
        },
        {
            title: "Step 5/5",
            text: "Forgot how to use the dashboard? You can click this button anytime to replay this guide.",
            targetId: "sharedHelpButton"
        }
    ];

    let currentStep = 0;

    // Function to update the modal content and position
    function updateStep() {
        const step = steps[currentStep];
        title.innerText = step.title;
        text.innerText = step.text;

        // Button logic
        btnPrev.style.display = currentStep === 0 ? "none" : "block";
        btnNext.innerText = currentStep === steps.length - 1 ? "Start exploring" : "Next";

        // Position the dialog and tab highlight
        positionWalkthrough(step.targetId);
    }

    function positionWalkthrough(targetId) {
        // Reset default positions
        dialog.style.top = "50%";
        dialog.style.left = "50%";
        dialog.style.transform = "translate(-50%, -50%)";
        dialog.style.right = "auto";

        tabHighlight.style.display = "none";

        if (targetId === ".tabs") {
            // STEP 1: 3 Navigation Tabs
            const tabsList = document.querySelectorAll(".tabs li a");
            if (tabsList.length === 0) return;

            const firstTab = tabsList[0].getBoundingClientRect();
            const lastTab = tabsList[2].getBoundingClientRect();

            tabHighlight.style.display = "block";
            tabHighlight.style.top = `${firstTab.top - 6}px`;
            tabHighlight.style.left = `${firstTab.left - 6}px`;
            tabHighlight.style.width = `${(lastTab.right - firstTab.left) + 12}px`;
            tabHighlight.style.height = `${firstTab.height + 12}px`;

            dialog.style.top = `${firstTab.bottom + 25}px`;
            dialog.style.left = "50%";
            dialog.style.transform = "translateX(-50%)";
        }
        else if (targetId === "sharedAboutButton") {
            // STEP 2: About Data Tab
            const aboutButton = document.getElementById("sharedAboutButton");
            if (!aboutButton) return;

            const rect = aboutButton.getBoundingClientRect();

            tabHighlight.style.display = "block";
            tabHighlight.style.top = `${rect.top - 6}px`;
            tabHighlight.style.left = `${rect.left - 6}px`;
            tabHighlight.style.width = `${rect.width + 12}px`;
            tabHighlight.style.height = `${rect.height + 12}px`;

            dialog.style.top = `${rect.bottom + 25}px`;
            dialog.style.left = "50%";
            dialog.style.transform = "translateX(-50%)";
        }
        else if (targetId === "yearFilter") {
            // STEP 3: Entire Filter Bar Container
            const filterBar = document.querySelector(".filter-bar");
            if (!filterBar) return;

            const rect = filterBar.getBoundingClientRect();

            tabHighlight.style.display = "block";
            tabHighlight.style.top = `${rect.top - 6}px`;
            tabHighlight.style.left = `${rect.left - 6}px`;
            tabHighlight.style.width = `${rect.width + 12}px`;
            tabHighlight.style.height = `${rect.height + 12}px`;

            // Place dialog under the filter bar
            dialog.style.top = `${rect.bottom + 25}px`;
            dialog.style.left = "50%";
            dialog.style.transform = "translateX(-50%)";
        }
        else if (targetId === "roadUserChart") {
            // STEP 4: Entire Bar Chart Container
            const chartCard = document.querySelector(".road-user-card");
            if (!chartCard) return;

            const rect = chartCard.getBoundingClientRect();
            const dialogWidth = 411; // Width of the walkthrough dialog
            const dialogHeight = 215; // Approximate height of the dialog
            const gap = 20; // Space between chart and dialog

            tabHighlight.style.display = "block";
            tabHighlight.style.top = `${rect.top - 6}px`;
            tabHighlight.style.left = `${rect.left - 6}px`;
            tabHighlight.style.width = `${rect.width + 12}px`;
            tabHighlight.style.height = `${rect.height + 12}px`;

            // 1. Try to place it to the RIGHT
            if (rect.right + gap + dialogWidth <= window.innerWidth) {
                dialog.style.top = "50%";
                dialog.style.left = `${rect.right + gap}px`;
                dialog.style.transform = "translateY(-50%)";
            }
            // 2. If no space on the right, try to place it ABOVE the chart
            else if (rect.top - gap - dialogHeight >= 0) {
                dialog.style.top = `${rect.top - gap - dialogHeight}px`;
                dialog.style.left = "50%";
                dialog.style.transform = "translateX(-50%)";
            }
            // 3. If no space above OR right, place it BELOW as a last resort
            else {
                dialog.style.top = `${rect.bottom + gap}px`;
                dialog.style.left = "50%";
                dialog.style.transform = "translateX(-50%)";
            }
        }
        else if (targetId === "sharedHelpButton") {
            // STEP 5: How to Use Button
            const helpButton = document.getElementById("sharedHelpButton");
            if (!helpButton) return;

            const rect = helpButton.getBoundingClientRect();
            const gap = 15;

            // 1. Turn on the spotlight to grey out the background
            tabHighlight.style.display = "block";
            tabHighlight.style.top = `${rect.top - 6}px`;
            tabHighlight.style.left = `${rect.left - 6}px`;
            tabHighlight.style.width = `${rect.width + 12}px`;
            tabHighlight.style.height = `${rect.height + 12}px`;

            // 2. Position the dialog directly under the button
            dialog.style.top = `${rect.bottom + gap}px`;
            dialog.style.left = "auto";
            dialog.style.right = "20px"; // Align right edge
            dialog.style.transform = "none";
        }
        else {
            // Fallback: Center
            dialog.style.top = "50%";
            dialog.style.left = "50%";
            dialog.style.transform = "translate(-50%, -50%)";
        }
    }

    function startWalkthrough() {
        currentStep = 0;
        updateStep();
        overlay.style.display = "block";
        if (!dialog.open) {
            dialog.showModal();
        }
    }

    function endWalkthrough() {
        overlay.style.display = "none";
        tabHighlight.style.display = "none";
        dialog.close();
    }

    // Button Events
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

    // Trigger on Load
    setTimeout(startWalkthrough, 800);

    // REPLAY: This allows the walkthrough to work on ANY page
    document.body.addEventListener("click", (e) => {
        // Check if the clicked element is the "How to use" button
        if (e.target.closest("#sharedHelpButton")) {
            e.preventDefault();
            startWalkthrough();
        }
    });

    // Handle window resize while walkthrough is open
    window.addEventListener("resize", () => {
        if (dialog.open) {
            positionWalkthrough(steps[currentStep].targetId);
        }
    });
});