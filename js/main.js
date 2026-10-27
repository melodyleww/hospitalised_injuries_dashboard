// js/main.js
import { loadData } from './data/loadData.js';
import { calculateKPIs } from './data/transform.js';
import { initDropdowns } from './interactions/dropdowns.js';
import { drawLineChart } from './charts/national/lineChart.js';
import { drawRoadUserChart, drawAgeGroupChart } from './charts/national/barCharts.js';
import { formatNumber, formatDecimal } from './utils/formatters.js';

document.addEventListener("DOMContentLoaded", () => {
    
    // Initialize Dropdown UI Logic
    initDropdowns();

    const yearSelect = document.getElementById("yearFilter");
    const roadUserSelect = document.getElementById("roadUserFilter");
    const resetBtn = document.querySelector(".btn-reset");

    // Load Data
    loadData().then(data => {
        window.globalData = data; 
        
        drawLineChart(window.globalData, "lineChart");
        drawRoadUserChart(window.globalData, "roadUserChart", 2021, "All", "All");
        drawAgeGroupChart(window.globalData, "ageGroupChart", 2021);
        
        // Calculate & Update KPIs using the new transform function
        const kpis = calculateKPIs(window.globalData, 2021);
        document.getElementById("kpiTotal").innerText = formatNumber(kpis.totalHosp);
        document.getElementById("kpiBedDays").innerText = formatDecimal(kpis.avgBedDays) + " days";
    });

    function updateDashboard() {
        const selectedYear = yearSelect.value === "All" ? 2021 : parseInt(yearSelect.value);
        const selectedRoadUser = roadUserSelect.value;

        document.querySelector(".road-user-card h2").innerText = "Road User Breakdown";
        drawRoadUserChart(window.globalData, "roadUserChart", selectedYear, selectedRoadUser, "All");

        if (selectedRoadUser === "All") {
            drawAgeGroupChart(window.globalData, "ageGroupChart", selectedYear);
            const kpis = calculateKPIs(window.globalData, selectedYear);
            document.getElementById("kpiTotal").innerText = formatNumber(kpis.totalHosp);
            document.getElementById("kpiBedDays").innerText = formatDecimal(kpis.avgBedDays) + " days";
        } else {
            const filteredData = window.globalData.filter(d => d.road_user === selectedRoadUser);
            drawAgeGroupChart(filteredData, "ageGroupChart", selectedYear);
            const kpis = calculateKPIs(filteredData, selectedYear);
            document.getElementById("kpiTotal").innerText = formatNumber(kpis.totalHosp);
            document.getElementById("kpiBedDays").innerText = formatDecimal(kpis.avgBedDays) + " days";
        }
    }

    yearSelect.addEventListener("change", updateDashboard);
    roadUserSelect.addEventListener("change", updateDashboard);

    resetBtn.addEventListener("click", () => {
        yearSelect.value = "2021";
        roadUserSelect.value = "All";
        document.querySelector(".road-user-card h2").innerText = "Road User Breakdown";

        drawLineChart(window.globalData, "lineChart");
        drawRoadUserChart(window.globalData, "roadUserChart", 2021, "All", "All");
        drawAgeGroupChart(window.globalData, "ageGroupChart", 2021);
        
        const kpis = calculateKPIs(window.globalData, 2021);
        document.getElementById("kpiTotal").innerText = formatNumber(kpis.totalHosp);
        document.getElementById("kpiBedDays").innerText = formatDecimal(kpis.avgBedDays) + " days";
    });
});