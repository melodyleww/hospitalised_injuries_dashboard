import { loadData } from './data/loadData.js';
import { drawLineChart } from './charts/national/lineChart.js';
import { drawRoadUserChart, drawAgeGroupChart, updateKPIs } from './charts/national/barCharts.js';

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Dropdown Arrow Logic ---
    const wrappers = document.querySelectorAll(".dropdown-wrapper");
    wrappers.forEach(wrapper => {
        const select = wrapper.querySelector(".dropdown");
        select.addEventListener("mousedown", () => {
            wrappers.forEach(w => w.classList.remove("open"));
            wrapper.classList.add("open");
        });
        select.addEventListener("change", () => wrapper.classList.remove("open"));
        document.addEventListener("click", (e) => {
            if (!wrapper.contains(e.target)) wrapper.classList.remove("open");
        });
    });

    // --- Global Variables ---
    const yearSelect = document.getElementById("yearFilter");
    const roadUserSelect = document.getElementById("roadUserFilter");
    const resetBtn = document.querySelector(".btn-reset");

    // --- Load Data & Initial Draw ---
    loadData().then(data => {
        window.globalData = data; // Make data global for the age chart clicks
        
        drawLineChart(window.globalData, "lineChart");
        drawRoadUserChart(window.globalData, "roadUserChart", 2021, "All", "All");
        drawAgeGroupChart(window.globalData, "ageGroupChart", 2021);
        updateKPIs(window.globalData, 2021);
    });

    // --- Filtering Function (Runs whenever a dropdown changes) ---
    function updateDashboard() {
        const selectedYear = yearSelect.value === "All" ? 2021 : parseInt(yearSelect.value);
        const selectedRoadUser = roadUserSelect.value;

        // Reset age chart title in case it was changed by clicking
        document.querySelector(".road-user-card h2").innerText = "Road User Breakdown";

        // 1. Update Road User Chart
        drawRoadUserChart(window.globalData, "roadUserChart", selectedYear, selectedRoadUser, "All");

        // 2. Cross-filter logic
        if (selectedRoadUser === "All") {
            drawAgeGroupChart(window.globalData, "ageGroupChart", selectedYear);
            updateKPIs(window.globalData, selectedYear);
        } else {
            const filteredData = window.globalData.filter(d => d.road_user === selectedRoadUser);
            drawAgeGroupChart(filteredData, "ageGroupChart", selectedYear);
            updateKPIs(filteredData, selectedYear);
        }
    }

    // --- Event Listeners for Auto-Filtering ---
    yearSelect.addEventListener("change", updateDashboard);
    roadUserSelect.addEventListener("change", updateDashboard);

    // --- Reset Filters Logic ---
    resetBtn.addEventListener("click", () => {
        yearSelect.value = "2021";
        roadUserSelect.value = "All";
        
        document.querySelector(".road-user-card h2").innerText = "Road User Breakdown";

        drawLineChart(window.globalData, "lineChart");
        drawRoadUserChart(window.globalData, "roadUserChart", 2021, "All", "All");
        drawAgeGroupChart(window.globalData, "ageGroupChart", 2021);
        updateKPIs(window.globalData, 2021);
    });
});