export function loadData() {
    return d3.csv("data/processed/national_clean.csv").then(data => {
        // Clean KNIME column names and ensure numbers
        data.forEach(d => {
            d.hospitalisations = +d["Sum(hospitalisations)"] || 0;
            d.bed_days = +d["Sum(bed_days)"] || 0;
            d.year = +d.year;
        });
        return data;
    });
}