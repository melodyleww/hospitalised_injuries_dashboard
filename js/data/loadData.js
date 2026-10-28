// js/data/loadData.js

// National data
export function loadData() {
    return d3.csv("data/processed/national_clean.csv").then(data => {
        data.forEach(d => {
            d.hospitalisations = +d["Sum(hospitalisations)"] || 0;
            d.bed_days = +d["Sum(bed_days)"] || 0;
            d.year = +d.year;
        });
        return data;
    });
}

// state_territory data
export async function loadStateData() {
    try {
        const injuryData = await d3.csv("data/processed/state_territory_cleaned_v2.csv");
        injuryData.forEach(d => {
            d.hospitalisations = d["Sum(hospitalisations)"] === "" ? null : +d["Sum(hospitalisations)"];
            d.bed_days = d["Sum(bed_days)"] === "" ? null : +d["Sum(bed_days)"];
            d.year = +d.year;
        });

        // Load Population Data: jurisdiction as key and total population as value
        const popDataRaw = await d3.csv("data/processed/state_population_2021_cleaned.csv");
        const populationMap = {};
        popDataRaw.forEach(d => {
            populationMap[d.jurisdiction] = +d.total; 
        });

        return { injuryData, populationMap };
    } catch (error) {
        console.error("Failed to load state data files. Please check your file paths:", error);
    }
}