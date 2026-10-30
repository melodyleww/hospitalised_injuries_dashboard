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

    let currentFilters = {
        year: "All",
        roadUser: "All",
        ageGroup: "All"
    };

    loadData().then(data => {
        window.globalData = data;
        updateDashboard();
        drawLineChart(window.globalData, "lineChart");
    });

    function updateDashboard() {
        const { year, roadUser, ageGroup } = currentFilters;
        
        let filteredData = window.globalData;
        if (year !== "All") filteredData = filteredData.filter(d => d.year === parseInt(year));
        if (roadUser !== "All") filteredData = filteredData.filter(d => d.road_user === roadUser);
        if (ageGroup !== "All") filteredData = filteredData.filter(d => d.age_group === ageGroup);

        const kpis = calculateKPIs(filteredData, "All");
        document.getElementById("kpiTotal").innerText = formatNumber(kpis.totalHosp);
        document.getElementById("kpiBedDays").innerText = formatDecimal(kpis.avgBedDays) + " days";

        roadUserTitle.innerText = (ageGroup === "All") ? "Road User Breakdown" : `Road Users for Age ${ageGroup}`;

        drawRoadUserChart(window.globalData, "roadUserChart", year, roadUser, ageGroup);
        drawAgeGroupChart(window.globalData, "ageGroupChart", year, ageGroup, roadUser);
    }

    window.applyAgeFilter = function(ageGroup) {
        currentFilters.ageGroup = (currentFilters.ageGroup === ageGroup) ? "All" : ageGroup;
        currentFilters.roadUser = "All";
        roadUserSelect.value = "All"; 
        updateDashboard();
    };

    yearSelect.addEventListener("change", (e) => {
        currentFilters.year = e.target.value;
        updateDashboard();
    });

    roadUserSelect.addEventListener("change", (e) => {
        currentFilters.roadUser = e.target.value;
        updateDashboard();
    });

    resetBtn.addEventListener("click", () => {
        currentFilters = { year: "All", roadUser: "All", ageGroup: "All" };
        yearSelect.value = "All";
        roadUserSelect.value = "All";
        updateDashboard();
    });

    // --- RESPONSIVE RESIZE HANDLING ---
    // Use a debounce timer to avoid redrawing hundreds of times per second
    let resizeTimer;

    function redrawAllCharts() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.globalData) {
                drawLineChart(window.globalData, "lineChart");
                const { year, roadUser, ageGroup } = currentFilters;
                drawRoadUserChart(window.globalData, "roadUserChart", year, roadUser, ageGroup);
                drawAgeGroupChart(window.globalData, "ageGroupChart", year, ageGroup, roadUser);
            }
        }, 150);
    }

    // 1. Listen to window resize events (e.g., user drags browser edge)
    window.addEventListener("resize", redrawAllCharts);

    // 2. Use a ResizeObserver to catch container size changes
    //    (e.g., when the layout switches from 6 columns to 1 column on mobile)
    const resizeObserver = new ResizeObserver(redrawAllCharts);
    const chartsContainer = document.querySelector(".charts-grid");
    if (chartsContainer) {
        resizeObserver.observe(chartsContainer);
    }
    // ----------------------
});