// js/utils/formatters.js

// Formats numbers with commas (e.g., 39505 -> 39,505)
export const formatNumber = d3.format(",");

// Formats years without commas (e.g., 2021 -> 2021)
export const formatYear = d3.format("d");

// Formats decimals to 1 place (e.g., 5.233 -> 5.2)
export const formatDecimal = (num) => num.toFixed(1);