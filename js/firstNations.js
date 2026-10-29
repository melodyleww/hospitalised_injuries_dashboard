import { loadFirstNationsData } from "./data/loadData.js";
import { drawAgeChart } from "./charts/firstNations/ageChart.js";
import { drawStackedBarChart } from "./charts/firstNations/stackedBarChart.js";
import { drawRoadUserChart } from "./charts/firstNations/roadUserChart.js";

async function initialiseFirstNations() {
  try {
    const data = await loadFirstNationsData();

    // Find the existing HTML controls
    const yearSelect = document.getElementById("fnYear");
    const populationSelect = document.getElementById("fnPopulation");
    const resetButton = document.getElementById("fnReset");

    // Build year options from the dataset
    //gets the years, removes repeated years, and turns them back into an array
    const years = [...new Set(data.map((row) => row.year))].sort(
      (a, b) => b - a,
    );

    yearSelect.replaceChildren(
      ...years.map((year) => new Option(String(year), String(year))),
    );

    // Default selections
    yearSelect.value = "2021";
    populationSelect.value = "Both";

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

      const ageRows = selectedRows.filter(
        (row) => row.breakdown_type === "age",
      );
      drawAgeChart(ageRows);

      const counterpartyRows = selectedRows.filter(
        (row) => row.breakdown_type === "counterparty",
      );
      drawStackedBarChart(counterpartyRows);

      const roadUserRows = selectedRows.filter(
        (row) => row.breakdown_type === "road_user",
      );
      drawRoadUserChart(roadUserRows);

      // Keep chart headings aligned with the selection
      document.getElementById("fnAgeTitle").textContent =
        `Age distribution, ${selectedYear}`;

      document.getElementById("fnCounterpartyTitle").textContent =
        `Counterparty distribution, ${selectedYear}`;

      document.getElementById("fnRoadTitle").textContent =
        `Hospitalisations by road user, ${selectedYear}`;

      console.table(ageRows);
    }

    // Redraw whenever either selection changes.
    yearSelect.addEventListener("change", updateDashboard);
    populationSelect.addEventListener("change", updateDashboard);

    // Restore the starting selections.
    resetButton.addEventListener("click", () => {
      yearSelect.value = "2021";
      populationSelect.value = "Both";
      updateDashboard();
    });

    // Apply the default selection on page load.
    updateDashboard();

    let resizeTimer;

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
