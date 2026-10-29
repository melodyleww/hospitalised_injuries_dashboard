export const COLORS = {
  primary: "#3498DB",
  secondary: "#9B59B6",
  warning: "#E74C3C", // Red for breaks
  text: "#1A2B4C", // Navy
  muted: "#6B7280", // Grey
  white: "#FFFFFF",
  green: "#00d382",
  orange: "#ff8819",
  darkGreen: "#00843D", //first nations
  yellow: "#FFCD00", //non-indigenous
};

export const MARGINS = {
  line: { top: 20, right: 30, bottom: 40, left: 60 },
  barHorizontal: { top: 5, right: 20, bottom: 20, left: 140 },
  barVertical: { top: 5, right: 20, bottom: 30, left: 75 }, // Reduced bottom margin
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
