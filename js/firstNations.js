import { loadFirstNationsData } from "./data/loadData.js";
import { drawAgeChart } from "./charts/firstNations/ageChart.js";
import { drawStackedBarChart } from "./charts/firstNations/stackedBarChart.js";
import { drawRoadUserChart } from "./charts/firstNations/roadUserChart.js";

async function initialiseFirstNations() {
  try {
    // Load data
    const data = await loadFirstNationsData();

    // Find the existing dropdwon reset controls
    const yearSelect = document.getElementById("fnYear");
    const populationSelect = document.getElementById("fnPopulation");
    const resetButton = document.getElementById("fnReset");

    // Build year options from the dataset
    // gets the years, removes repeated years, and turns them back into an array
    const years = [...new Set(data.map((row) => row.year))].sort(
      (a, b) => b - a,
    );

    // Replace all <option> element inside year dropdown
    yearSelect.replaceChildren(
      ...years.map((year) => new Option(String(year), String(year))),
    );

    // Default selections
    yearSelect.value = "2021";
    populationSelect.value = "Both";

    //Re-render all chart based on current filter selection
    function updateDashboard() {
      const selectedYear = Number(yearSelect.value);
      const selectedPopulation = populationSelect.value;

      // Filter by year and population before selecting breakdowns
      const selectedRows = data.filter(
        (row) =>
          row.year === selectedYear &&
          (selectedPopulation === "Both" ||
            row.first_nations_status === selectedPopulation),
      );

      // Split filtered row by breakdown type and draw each chart
      const ageRows = selectedRows.filter(
        (row) => row.breakdown_type === "age",
      );
      drawAgeChart(ageRows); // draw the paired bar chart

      const counterpartyRows = selectedRows.filter(
        (row) => row.breakdown_type === "counterparty",
      );
      drawStackedBarChart(counterpartyRows); // draw stacked bar chart

      const roadUserRows = selectedRows.filter(
        (row) => row.breakdown_type === "road_user",
      );
      drawRoadUserChart(roadUserRows); //road user paired bar chart

      // Keep chart headings aligned with the selection
      document.getElementById("fnAgeTitle").textContent =
        `Age distribution, ${selectedYear}`;

      document.getElementById("fnCounterpartyTitle").textContent =
        `Counterparty distribution, ${selectedYear}`;

      document.getElementById("fnRoadTitle").textContent =
        `Hospitalisations by road user, ${selectedYear}`;

      console.table(ageRows);
    }

    // Redraw whenever either selection changes
    yearSelect.addEventListener("change", updateDashboard);
    populationSelect.addEventListener("change", updateDashboard);

    // Restore the starting selections
    resetButton.addEventListener("click", () => {
      yearSelect.value = "2021";
      populationSelect.value = "Both";
      updateDashboard();
    });

    // Apply the default selection on page load
    updateDashboard();

    let resizeTimer; // debounce timer used by resize observer

    // Redraw all chart when container size changed
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        updateDashboard();
      }, 100);
    });

    resizeObserver.observe(document.getElementById("fnAgeChart"));
    resizeObserver.observe(document.getElementById("fnCounterpartyChart"));
    resizeObserver.observe(document.getElementById("fnRoadChart"));
  } catch (error) {
    console.error("First Nations dashboard could not load:", error);
  }
}

initialiseFirstNations();
