// js/config.js

export const COLORS = {
    primary: "#3498DB",     // Blue - Line chart & Road User bars
    secondary: "#9B59B6",   // Purple - Age Group bars
    warning: "#E74C3C",     // Red - Time-series break lines
    text: "#1A2B4C",        // Navy - Title text
    muted: "#6B7280",       // Grey - Axis labels
    white: "#FFFFFF",       // White - Backgrounds
    green: "#00d382",       // Green - General use
    orange: "#ff8819",      // Orange - General use
    darkGreen: "#00843D",   // First Nations
    yellow: "#FFCD00",      // Non-Indigenous
};

export const MARGINS = {
    line: { top: 20, right: 30, bottom: 40, left: 60 },
    barHorizontal: { top: 5, right: 20, bottom: 20, left: 140 }, 
    barVertical: { top: 5, right: 20, bottom: 30, left: 75 }
};

// Consistent population colours for AGE and ROAD-USER charts
export const POPULATION_COLORS = {
    "First Nations people": COLORS.darkGreen,
    "Non-Indigenous": COLORS.yellow,
};

// Counterparty categories four distinct colours
export const COUNTERPARTY_COLORS = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.green,
    COLORS.orange,
];

// Source values: used for filtering and consistent chart order
export const POPULATION_ORDER = ["First Nations people", "Non-Indigenous"];

// Display labels: used for axes, legends and descriptions
export const POPULATION_LABELS = {
    "First Nations people": "First Nations peoples",
    "Non-Indigenous": "Non-Indigenous Australians",
};