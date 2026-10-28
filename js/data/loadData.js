// js/data/loadData.js

// National data
export function loadData() {
  return d3.csv("data/processed/national_clean.csv").then((data) => {
    data.forEach((d) => {
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
    const injuryData = await d3.csv(
      "data/processed/state_territory_cleaned_v2.csv",
    );
    injuryData.forEach((d) => {
      d.hospitalisations =
        d["Sum(hospitalisations)"] === "" ? null : +d["Sum(hospitalisations)"];
      d.bed_days = d["Sum(bed_days)"] === "" ? null : +d["Sum(bed_days)"];
      d.year = +d.year;
    });

    // Load Population Data: jurisdiction as key and total population as value
    const popDataRaw = await d3.csv(
      "data/processed/state_population_2021_cleaned.csv",
    );
    const populationMap = {};
    popDataRaw.forEach((d) => {
      populationMap[d.jurisdiction] = +d.total;
    });

    return { injuryData, populationMap };
  } catch (error) {
    console.error(
      "Failed to load state data files. Please check your file paths:",
      error,
    );
  }
}

//-----FIRST NATIONS-----//
// Preserve missing numeric values instead of converting them to zero.
function numberOrNull(value) {
  if (value == null || String(value).trim() === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

// Load the First Nations CSV using its own column structure.
export async function loadFirstNationsData() {
  const rows = await d3.csv("data/processed/first_nations_cleaned.csv");

  return rows.map((row) => ({
    ...row,
    year: numberOrNull(row.year),
    hospitalisations: numberOrNull(row.hospitalisations),
    bed_days: numberOrNull(row.bed_days),
    half_years_present: numberOrNull(row.half_years_present),
    hospitalisations_suppressed_count: numberOrNull(
      row.hospitalisations_suppressed_count,
    ),
    bed_days_suppressed_count: numberOrNull(row.bed_days_suppressed_count),
    hospitalisation_share_pct: numberOrNull(row.hospitalisation_share_pct),
  }));
}
