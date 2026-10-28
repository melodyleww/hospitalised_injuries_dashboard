// js/state-comparisons.js
import { loadStateData } from './data/loadData.js';
import { initDropdowns } from './interactions/dropdowns.js';
import { drawStateLineChart } from './charts/state_territory/lineChart.js';
import { drawStateBarChart } from './charts/state_territory/barChart.js';
import { drawRoadUserPieChart } from './charts/state_territory/pieChart.js';
import { drawAgeHeatmap } from './charts/state_territory/heatmap.js';

document.addEventListener("DOMContentLoaded", async () => {
    
    initDropdowns();

    let currentViewMode = "count"; 
    let currentYear = 2021; 
    let currentRoadUser = "All"; 
    let currentStateFilter = "All"; 

    const yearLabel = document.getElementById("yearLabel");
    const yearSelect = document.getElementById("yearFilter");
    const roadUserSelect = document.getElementById("roadUserFilter");
    const lineChartTitle = document.getElementById("lineChartTitle"); 

    const { injuryData, populationMap } = await loadStateData();
    
    function updateLineChartTitle() {
        if (!lineChartTitle) return;
        let title = "Annual Hospitalisation Trends ";
        title += (currentStateFilter !== "All") ? `for ${currentStateFilter} ` : `by State `;
        if (currentRoadUser !== "All") title += `(${currentRoadUser})`;
        lineChartTitle.innerText = title;
    }

    function updateBarChartTitle() {
        const barTitleEl = document.getElementById("barChartTitle");
        if (barTitleEl) {
            barTitleEl.innerHTML = currentRoadUser === "All" 
                ? `Injuries by Jurisdiction (<span id="yearLabel">${currentYear}</span>)` 
                : `${currentRoadUser} Injuries by Jurisdiction (<span id="yearLabel">${currentYear}</span>)`;
        }
    }

    // --- MASTER RENDER FUNCTION ---
    function updateAllCharts() {
        updateLineChartTitle();
        updateBarChartTitle();
        
        drawStateLineChart(injuryData, "lineChart", currentRoadUser, currentStateFilter);
        drawStateBarChart(injuryData, populationMap, "stateBarChart", currentYear, currentViewMode, currentRoadUser, currentStateFilter, handleStateFilter);
        drawRoadUserPieChart(injuryData, "roadUserChart", currentYear, currentStateFilter, currentRoadUser, handleRoadUserFilter);
        
        // Draw Heatmap (It will handle its own title internally)
        drawAgeHeatmap(injuryData, "ageHeatmap", currentRoadUser, currentStateFilter);
    }

    setTimeout(updateAllCharts, 50);

    // Radio Toggle
    const radioButtons = document.querySelectorAll('input[name="viewMode"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentViewMode = e.target.value;
            drawStateBarChart(injuryData, populationMap, "stateBarChart", currentYear, currentViewMode, currentRoadUser, currentStateFilter, handleStateFilter);
        });
    });

    // Year Dropdown (Does NOT update Heatmap or Line Chart)
    if (yearSelect) {
        yearSelect.addEventListener("change", (e) => {
            currentYear = +e.target.value;
            if(yearLabel) yearLabel.innerText = currentYear;
            // Only update Bar and Pie
            drawStateBarChart(injuryData, populationMap, "stateBarChart", currentYear, currentViewMode, currentRoadUser, currentStateFilter, handleStateFilter);
            drawRoadUserPieChart(injuryData, "roadUserChart", currentYear, currentStateFilter, currentRoadUser, handleRoadUserFilter);
        });
    }

    // Road User Dropdown
    if (roadUserSelect) {
        roadUserSelect.addEventListener("change", (e) => {
            currentRoadUser = e.target.value;
            updateAllCharts(); 
        });
    }

    // Click Bar (State Filter) -> Updates ALL charts including Heatmap
    function handleStateFilter(state) {
        currentStateFilter = (currentStateFilter === state) ? "All" : state;
        updateAllCharts();
    }

    // Click Pie Slice (Road User Filter) -> Updates Line & Bar charts
    function handleRoadUserFilter(roadUser) {
        currentRoadUser = (currentRoadUser === roadUser) ? "All" : roadUser;
        if (roadUserSelect) roadUserSelect.value = currentRoadUser;
        updateAllCharts(); // Heatmap will redraw, but its internal filter won't change (since it's Total age data)
    }

    // Reset Button
    const resetBtn = document.querySelector(".btn-reset");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            yearSelect.value = "2021";
            roadUserSelect.value = "All";
            currentYear = 2021;
            currentRoadUser = "All";
            currentStateFilter = "All"; 
            
            if(yearLabel) yearLabel.innerText = 2021;
            document.querySelector('input[name="viewMode"][value="count"]').checked = true;
            currentViewMode = "count";

            updateAllCharts();
        });
    }
}); 