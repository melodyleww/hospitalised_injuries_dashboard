// js/main.js
import { loadData } from './data/loadData.js';
import { calculateKPIs } from './data/transform.js';
import { initDropdowns } from './interactions/dropdowns.js';
import { drawLineChart } from './charts/national/lineChart.js';
import { drawRoadUserChart, drawAgeGroupChart } from './charts/national/barCharts.js';
import { formatNumber, formatDecimal } from './utils/formatters.js';

document.addEventListener("DOMContentLoaded", () => {
    
    initDropdowns();

    const yearSelect = document.getElementById("yearFilter");
    const roadUserSelect = document.getElementById("roadUserFilter");
    const resetBtn = document.querySelector(".btn-reset");
    const roadUserTitle = document.querySelector(".road-user-card h2");

    // Track the selected age group globally
    window.currentAgeGroup = "All";

    // Load Data
    loadData().then(data => {
        window.globalData = data; 
        
        drawLineChart(window.globalData, "lineChart");
        // Default to "All" for initial load
        drawRoadUserChart(window.globalData, "roadUserChart", "All", "All", "All");
        drawAgeGroupChart(window.globalData, "ageGroupChart", "All", "All");
        
        const kpis = calculateKPIs(window.globalData, "All");
        document.getElementById("kpiTotal").innerText = formatNumber(kpis.totalHosp);
        document.getElementById("kpiBedDays").innerText = formatDecimal(kpis.avgBedDays) + " days";
    });

    function updateDashboard() {
        const selectedYear = yearSelect.value === "All" ? "All" : parseInt(yearSelect.value);
        const selectedRoadUser = roadUserSelect.value;

        window.currentAgeGroup = "All";
        roadUserTitle.innerText = "Road User Breakdown";

        drawRoadUserChart(window.globalData, "roadUserChart", selectedYear, selectedRoadUser, window.currentAgeGroup);
        drawAgeGroupChart(window.globalData, "ageGroupChart", selectedYear, window.currentAgeGroup);

        if (selectedRoadUser === "All") {
            const kpis = calculateKPIs(window.globalData, selectedYear);
            document.getElementById("kpiTotal").innerText = formatNumber(kpis.totalHosp);
            document.getElementById("kpiBedDays").innerText = formatDecimal(kpis.avgBedDays) + " days";
        } else {
            const filteredData = window.globalData.filter(d => d.road_user === selectedRoadUser);
            const kpis = calculateKPIs(filteredData, selectedYear);
            document.getElementById("kpiTotal").innerText = formatNumber(kpis.totalHosp);
            document.getElementById("kpiBedDays").innerText = formatDecimal(kpis.avgBedDays) + " days";
        }
    }

    window.applyAgeFilter = function(ageGroup) {
        window.currentAgeGroup = ageGroup;
        const selectedYear = yearSelect.value === "All" ? "All" : parseInt(yearSelect.value);
        
        if (ageGroup === "All") {
            roadUserTitle.innerText = "Road User Breakdown";
        } else {
            roadUserTitle.innerText = `Road Users for Age ${ageGroup}`;
            roadUserSelect.value = "All"; 
        }

        drawRoadUserChart(window.globalData, "roadUserChart", selectedYear, "All", window.currentAgeGroup);
        drawAgeGroupChart(window.globalData, "ageGroupChart", selectedYear, window.currentAgeGroup);
    };

    yearSelect.addEventListener("change", updateDashboard);
    roadUserSelect.addEventListener("change", updateDashboard);

    resetBtn.addEventListener("click", () => {
        yearSelect.value = "All"; // Reset to All
        roadUserSelect.value = "All";
        window.currentAgeGroup = "All";
        roadUserTitle.innerText = "Road User Breakdown";

        drawLineChart(window.globalData, "lineChart");
        drawRoadUserChart(window.globalData, "roadUserChart", "All", "All", "All");
        drawAgeGroupChart(window.globalData, "ageGroupChart", "All", "All");
        
        const kpis = calculateKPIs(window.globalData, "All");
        document.getElementById("kpiTotal").innerText = formatNumber(kpis.totalHosp);
        document.getElementById("kpiBedDays").innerText = formatDecimal(kpis.avgBedDays) + " days";
    });
});