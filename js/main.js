// js/main.js

import { loadData } from "./data/loadData.js";
import { calculateKPIs } from "./data/transform.js";
import { initDropdowns } from "./interactions/dropdowns.js";
import { drawLineChart } from "./charts/national/lineChart.js";
import {
  drawRoadUserChart,
  drawAgeGroupChart,
} from "./charts/national/barCharts.js";
import { formatNumber, formatDecimal } from "./utils/formatters.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize custom dropdown UI behaviours
  initDropdowns();

  // DOM Elements
  const yearSelect = document.getElementById("yearFilter");
  const roadUserSelect = document.getElementById("roadUserFilter");
  const resetBtn = document.querySelector(".btn-reset");
  const roadUserTitle = document.querySelector(".road-user-card h2");

  // 1. Centralised State Management
  // Tracks the user's current selections across all charts
  let currentFilters = {
    year: "All",
    roadUser: "All",
    ageGroup: "All",
  };

  // Load the cleaned CSV data and render the initial dashboard
  loadData().then((data) => {
    window.globalData = data; // Store globally for cross-chart filtering
    updateDashboard();
    drawLineChart(window.globalData, "lineChart");
  });

  // 2. Main Render Function
  // Updates KPIs and redraws charts based on currentFilters state
  function updateDashboard() {
    const { year, roadUser, ageGroup } = currentFilters;

    // Filter the dataset based on active state
    let filteredData = window.globalData;
    if (year !== "All")
      filteredData = filteredData.filter((d) => d.year === parseInt(year));
    if (roadUser !== "All")
      filteredData = filteredData.filter((d) => d.road_user === roadUser);
    if (ageGroup !== "All")
      filteredData = filteredData.filter((d) => d.age_group === ageGroup);

    // Update KPI cards
    const kpis = calculateKPIs(filteredData, "All");
    document.getElementById("kpiTotal").innerText = formatNumber(
      kpis.totalHosp,
    );
    document.getElementById("kpiBedDays").innerText =
      formatDecimal(kpis.avgBedDays) + " days";

    // Update dynamic chart title based on active filters
    roadUserTitle.innerText =
      ageGroup === "All"
        ? "Road User Breakdown"
        : `Road Users for Age ${ageGroup}`;

    // Redraw the bar charts
    drawRoadUserChart(
      window.globalData,
      "roadUserChart",
      year,
      roadUser,
      ageGroup,
    );
    drawAgeGroupChart(
      window.globalData,
      "ageGroupChart",
      year,
      ageGroup,
      roadUser,
    );
  }

  // 3. Cross-Filtering Interaction
  // Global function called when a user clicks an Age Group bar
  window.applyAgeFilter = function (ageGroup) {
    // Toggle logic: if clicking the already selected age, reset to "All"
    currentFilters.ageGroup =
      currentFilters.ageGroup === ageGroup ? "All" : ageGroup;
    // Reset road user filter to avoid conflicting empty states
    currentFilters.roadUser = "All";
    roadUserSelect.value = "All";
    updateDashboard();
  };

  // 4. Event Listeners for Filter Controls
  yearSelect.addEventListener("change", (e) => {
    currentFilters.year = e.target.value;
    updateDashboard();
  });

  roadUserSelect.addEventListener("change", (e) => {
    currentFilters.roadUser = e.target.value;
    updateDashboard();
  });

  // Reset button returns dashboard to default state
  resetBtn.addEventListener("click", () => {
    currentFilters = { year: "All", roadUser: "All", ageGroup: "All" };
    yearSelect.value = "All";
    roadUserSelect.value = "All";
    updateDashboard();
  });

  // ==========================================
  // 5. RESPONSIVE RESIZE HANDLING (ResizeObserver)
  // ==========================================
  
  let resizeTimer;
  const previousSizes = new WeakMap();

  // Debounced function to prevent rapid redrawing while user drags window
  function scheduleChartRedraw() {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      if (!window.globalData) return;

      const { year, roadUser, ageGroup } = currentFilters;

      // The trend always keeps the full timeline (no filters applied)
      drawLineChart(window.globalData, "lineChart");

      // Preserve the current selections in both breakdown charts
      drawRoadUserChart(
        window.globalData,
        "roadUserChart",
        year,
        roadUser,
        ageGroup,
      );

      drawAgeGroupChart(
        window.globalData,
        "ageGroupChart",
        year,
        ageGroup,
        roadUser,
      );
    }, 150); // 150ms delay
  }

  // Watches individual chart containers for dimension changes
  const resizeObserver = new ResizeObserver((entries) => {
    let sizeChanged = false;

    entries.forEach((entry) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      const previous = previousSizes.get(entry.target);

      // Only trigger redraw if the size actually changed (prevents infinite loops)
      if (!previous || previous.width !== width || previous.height !== height) {
        previousSizes.set(entry.target, { width, height });
        sizeChanged = true;
      }
    });

    if (sizeChanged) {
      scheduleChartRedraw();
    }
  });

  // Observe the specific chart drawing areas
  ["lineChart", "roadUserChart", "ageGroupChart"].forEach((id) => {
    const container = document.getElementById(id);

    if (container) {
      resizeObserver.observe(container);
    }
  });
});