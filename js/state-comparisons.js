// js/state-comparisons.js
import { loadStateData } from './data/loadData.js';
import { initDropdowns } from './interactions/dropdowns.js';
import { drawStateLineChart } from './charts/state_territory/lineChart.js';
import { drawStateBarChart } from './charts/state_territory/barChart.js';
import { drawRoadUserPieChart } from './charts/state_territory/pieChart.js';

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
    
    // --- TITLE HELPER FUNCTIONS ---
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
        
        // Pass currentStateFilter to Line Chart
        drawStateLineChart(injuryData, "lineChart", currentRoadUser, currentStateFilter);
        
        // Pass currentStateFilter to Bar Chart (crucial for greying out)
        drawStateBarChart(injuryData, populationMap, "stateBarChart", currentYear, currentViewMode, currentRoadUser, currentStateFilter, handleStateFilter);
        
        // Pass currentStateFilter to Pie Chart
        drawRoadUserPieChart(injuryData, "roadUserChart", currentYear, currentStateFilter, currentRoadUser, handleRoadUserFilter);
    }

    // Initial Draw
    setTimeout(updateAllCharts, 50);

    // Radio Toggle (Count vs Rate)
    const radioButtons = document.querySelectorAll('input[name="viewMode"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentViewMode = e.target.value;
            drawStateBarChart(injuryData, populationMap, "stateBarChart", currentYear, currentViewMode, currentRoadUser, currentStateFilter, handleStateFilter);
        });
    });

    // Year Dropdown
    if (yearSelect) {
        yearSelect.addEventListener("change", (e) => {
            currentYear = +e.target.value;
            if(yearLabel) yearLabel.innerText = currentYear;
            updateAllCharts(); 
        });
    }

    // Road User Dropdown
    if (roadUserSelect) {
        roadUserSelect.addEventListener("change", (e) => {
            currentRoadUser = e.target.value;
            updateAllCharts(); 
        });
    }

    // --- CROSS-FILTER HANDLERS ---
    
    // Click a Bar (State) -> Updates Line Chart & Pie Chart & Bar Colors
    function handleStateFilter(state) {
        currentStateFilter = (currentStateFilter === state) ? "All" : state;
        updateAllCharts(); // Redraws everything with the new state filter
    }

    // Click a Pie Slice (Road User) -> Updates Bar Chart & Line Chart
    function handleRoadUserFilter(roadUser) {
        currentRoadUser = (currentRoadUser === roadUser) ? "All" : roadUser;
        if (roadUserSelect) roadUserSelect.value = currentRoadUser;
        updateAllCharts(); 
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