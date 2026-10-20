# Cleaning Log: State and Territory Hospitalised Injuries

**File Name:** `state_territory_2011_2021.xlsx`
**Sheet Used:** `raw`
**Tool Used:** KNIME Analytics Platform

---

## 1. File Summary
- **Input Data:** The `raw` tab in the Excel file, which contains 5 side-by-side tables (Totals, Road User, Sex, Age Group, Counterparty) at a 6-monthly granularity.
- **Column Count Before Cleaning:** 38 columns (A to AL).
- **Column Count After Cleaning:** 9 columns (year, road_user, sex, age_group, counterparty, Sum(hospitalisations), Sum(bed_days), jurisdiction, data_quality_flag)

---

## 2. Transformations Applied
The following transformations were applied using KNIME nodes:

1. **Data Extraction & Splitting:** 
   - The `Excel Reader` was configured to skip the first 2 header rows and read the data without column headers.
   - Five `Column Splitter` nodes were used to separate the 5 side-by-side tables into independent data streams based on their column indices.
2. **Column Naming:** 
   - `Column Rename` nodes were used to replace generic KNIME names (e.g., `Col0`) with descriptive schema names (e.g., `year`, `jurisdiction`, `hospitalisations`).
3. **Blank Row Removal:** 
   - A `Row Filter` was applied to each stream to exclude rows where the `year` column was missing. This removed the structural padding rows created by the Excel Reader.
4. **Category Standardisation:** 
   - `Rule Engine` nodes were used to standardise text labels.
   - *Example:* "Car driver, passenger or unknown position" was renamed to "Car driver/passenger".
   - *Age Group:* "65-74" and "75+" were merged into "65+".
5. **Missing Value Handling (`n.p.`):**
   - `Rule Engine` nodes replaced the string `"n.p."` with empty strings (`""`).
   - `String to Number` nodes converted the text to numeric types. The "Fail on error" option was **unticked**, which converted the empty strings into missing values (`?`), ensuring `n.p.` cases were not imputed as `0`.
6. **Data Quality Flagging:**
   - A `Rule Engine` was used to create the `data_quality_flag` column. It flagged time series breaks (`Vic_break_2012`, `NSW_break_2017`) and remaining missing values as `n.p._suppressed`.
7. **Aggregation (GroupBy):**
   - `GroupBy` nodes were used to sum the 6-monthly data (`Jan-Jun` and `Jul-Dec`) into annual totals. The `hospitalisations` and `bed_days` columns were aggregated using the `Sum` method.
8. **Concatenation:**
   - Four chained `Concatenate` nodes were used to append the 5 streams back together. The `Column handling` was set to **Union**, which correctly aligned the different dimensions and created `?` values for columns not present in a specific stream.

---

## 3. `n.p.` Value Counts
*These counts reflect the number of `n.p.` cells present in the original raw data that were converted to missing values (`?`).*

| Dimension / Table | `n.p.` Count in `hospitalisations` | `n.p.` Count in `bed_days` |
| :--- | :--- | :--- |
| **Totals (State/Territory)** | 0 | 0 |
| **Road User** | 185 | 185 |
| **Sex** | 0 | 0 |
| **Age Group** | 80 | 80 |
| **Counterparty** | 0 | 0 |

*(Note: String to Number node converted these into NA.)*

---

## 4. Blank Cells Converted to NA
Because the Excel file contained 5 tables of varying lengths, KNIME automatically filled rows 177 to 1,371 with blank cells for Table 1. (Same for other tables)
- **Action Taken:** `Row Filter` nodes were used to exclude these structural blank rows before aggregation.
- **Count of blank rows removed:** ~1,195 rows per stream. (For Table 1)

---

## 5. Duplicate Rows Removed
- **Count:** 0 
- **Reason:** Because the `GroupBy` nodes were used to aggregate the 6-monthly data, KNIME condensed the data into unique annual rows (e.g., 1 row for 2011 NSW). No manual duplicate removal was necessary.

---

## 6. Discrepancies and Resolutions
**Discrepancy: Time Series Breaks**
- **Issue:** Victoria's data (from 2012) and NSW's data (from 2017) changed inclusion criteria, making them incomparable to previous years.
- **Resolution:** A Rule Engine successfully flagged these years with `Vic_break_2012` and `NSW_break_2017` in the `data_quality_flag` column.

---

## 7. Validation Checks

### 11.1 Row Count Check
- **Status:** Passed.
- The number of rows in each cleaned stream matches the unique combinations of year, jurisdiction, and the specific dimension.

### 11.2 Category Label Check
- **Status:** Passed.
- All labels (Road User, Sex, Age Group, Counterparty) exactly match the standardised strings defined in Section 3 of the Data Contract. (e.g., `65+`, `Car driver/passenger`).

### 11.3 Missing Value Check
- **Column:** `hospitalisations` and `bed_days`
- **Status:** Acknowledged.
- These columns contain `?` (NA) values strictly because of `n.p.` suppression in the raw data. There are no unexpected missing values in the dimension columns (`year`, `jurisdiction`, etc.).

---

## 8. Final Output
The final output of the KNIME workflow is a single, unified table that matches the **Common Schema** in Section 2 of the Data Contract. 
- **Export Format:** `.csv`
- **File Name:** `state_territory_cleaned.csv`