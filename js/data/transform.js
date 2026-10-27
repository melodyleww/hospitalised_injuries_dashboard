// js/data/transform.js

export function calculateKPIs(data, selectedYear) {
    const yearData = data.filter(d => d.year === selectedYear);
    
    const totalHosp = d3.sum(yearData, d => d.hospitalisations);
    const totalBedDays = d3.sum(yearData, d => d.bed_days);
    const avgBedDays = totalHosp > 0 ? (totalBedDays / totalHosp) : 0;

    return { totalHosp, avgBedDays };
}