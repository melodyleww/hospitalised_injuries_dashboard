# Cleaning Log — First Nations Data

## 1. Source and ownership

- Source: `data/raw/first_nations_2011_2021.xlsx`
- Worksheet: `raw`
- KNIME workflow: `first_nations_KNIME_Group17.knwf`
- Coverage: 2011–2021
- Original workbook preserved unchanged.

## 2. Data selection

Four separate Excel Readers imported the following breakdowns:

- Age: Q–W, containing 264 half-year records.
- Road user: I–O, containing 351 half-year records.
- Remoteness: Y–AE, containing 132 half-year records.
- Counterparty: AG–AM, containing 176 half-year records.

Row 2 was used for column names, with data starting at row 3. Title rows, blank separator columns and empty records were excluded.

The A–G block was excluded because it repeats the age data in Q–W.

The four retained breakdowns describe different dimensions of overlapping hospitalisations. They were processed separately during cleaning and aggregation to avoid incorrectly adding counts from different breakdowns together.

## 3. Column names and data types

Column names were standardised to:

- `year`
- `half_year`
- `first_nations_status`
- `age_group`, `road_user`, `remoteness` or `counterparty`
- `hospitalisations`
- `bed_days`

`year` was stored as an integer. Categories were retained as text, and `hospitalisations` and `bed_days` were stored as numeric values.

For the final combined dataset, the four breakdown-specific category columns were standardised further:

- `age_group` → category
- `road_user` → category
- `remoteness` → category
- `counterparty` → category

A new string field `breakdown_type` was added to identify the source breakdown of each row:

- `age`
- `road_user`
- `remoteness`
- `counterparty`

## 4. Suppression and missing values

Suppression flags were created before replacing `n.p.` values.

Source inspection identified:

- Age: 4 suppressed hospitalisation cells and 4 suppressed bed-day cells.
- Road user: 62 suppressed hospitalisation cells and 62 suppressed bed-day cells.
- Remoteness and counterparty: no suppressed measure values.

For age and road user, String Manipulation removed the suppression text, and String to Number converted the measures to numeric values. Suppressed values became missing values.

Remoteness and counterparty measures were already numeric, so these conversion nodes were unnecessary. Their suppression flags were set to zero.

Missing values were not replaced with zero. Withheld values were not reconstructed from other totals.

## 5. Duplicate checks

Separate GroupBy checking branches counted records for each combination of year, half-year, population group and breakdown category.

- Age: all counts equal 1 — PASS.
- Road user: all counts equal 1 — PASS.
- Remoteness: all counts equal 1 — PASS.
- Counterparty: all counts equal 1 — PASS.

The repeated age block was excluded during import rather than combined with the retained age table.

## 6. Annual aggregation

Half-year records were grouped by year, population group and breakdown category.

The workflow calculated:

- Sum of hospitalisations and bed days.
- Number of distinct half-years.
- Number of non-missing values for each measure.
- Number of suppressed records for each measure.

For age and road user, annual measures were retained only when both half-year periods were present and both corresponding measure values were numeric. If these completeness conditions were not met, the annual measure remained missing.

For example, the 2011 First Nations bus-occupant category had only one half-year record, so its annual hospitalisation and bed-day values remained missing.

For remoteness and counterparty, annual sums were retained after confirming complete half-year coverage and numeric measure values.

Validation results:

- Remoteness: all 66 annual groups contained two distinct half-years and two valid numeric values for both hospitalisations and bed days — PASS
- Counterparty: all 88 annual groups contained two distinct half-years and two valid numeric values for both hospitalisations and bed days — PASS

## 7. Long-format integration and percentage calculations

_Combining the annual breakdowns_
The four breakdowns were cleaned and aggregated independently. Column Renamer nodes standardised their category columns to category, and Constant Value Column nodes added breakdown_type

The annual branches contained:

- Age: 132 rows
- Road user: 176 rows
- Remoteness: 66 rows
- Counterparty: 88 rows

Concatenate nodes vertically combined these branches into a base dataset containing 462 rows and 9 columns. Counts were not added across breakdowns because they describe overlapping hospitalisation cases

_Age percentages_
A GroupBy node calculated the number of distinct age groups, the number of published hospitalisation values and the hospitalisation total for each year and population
A Row Filter retained only population-year combinations containing all six age groups and six published annual hospitalisation values. This retained 20 complete combinations
The totals were joined to the matching annual age records by year and population. A Math Formula node calculated:

`age_share_pct = 100 × hospitalisations ÷ age_total_available`

This produced 120 age-percentage records. The two population distributions for 2014 were excluded from percentage calculation because they were incomplete. Their original annual records were retained in the base dataset.

_Counterparty percentages_
The same approach checked for four distinct counterparty categories and four published annual hospitalisation values within each year and population
All 22 population-year combinations were complete. The totals were joined to the corresponding counterparty records, and a Math Formula node calculated:

`counterparty_share_pct = 100 × hospitalisations ÷ counterparty_total_available`

This produced 88 counterparty-percentage records

_Adding percentages to the combined dataset_
Column Filter nodes retained the matching keys and calculated percentages. Column Renamer nodes standardised the percentage column to hospitalisation_share_pct and the category column to category. Constant Value Column nodes identified the breakdown as age or counterparty
These two percentage branches were concatenated into a lookup containing 208 rows and 5 columns
A left outer join added the percentages to the 462-row base dataset using four matching keys:

- year
- first_nations_status
- breakdown_type
- category

The join retained every base record and added only hospitalisation_share_pct. The final dataset therefore contained 462 rows and 10 columns
Road-user and remoteness percentages were not calculated. Their percentage fields remain empty, as do the age percentage fields for 2014

## 8. Output files

The current workflow exports one combined dataset:

`first_nations_cleaned.csv — 462 rows × 10 columns.`

The final columns are:

- year
- first_nations_status
- category
- half_years_present
- hospitalisations_suppressed_count
- bed_days_suppressed_count
- hospitalisations
- bed_days
- breakdown_type
- hospitalisation_share_pct

The percentage field stores values on a 0–100 scale. For example, a value of 30.90 represents 30.90%
Percentage values retain their calculated precision in the CSV. Rounding is applied for presentation where required
The CSV Writer saves the output in the workflow’s Data folder. The dashboard copy is stored in data/processed/first_nations_cleaned.csv

## 9. Validation results

- Final output contains 462 rows and 10 columns — PASS
- Breakdown counts remain age 132, road user 176, remoteness 66 and counterparty 88 — PASS
- No duplicate combinations of year, population, breakdown type and category — PASS
- Age percentages are populated for 120 records across 20 complete population-year distributions — PASS
- All 12 age records for 2014 remain in the final dataset, with missing percentages — PASS
- Counterparty percentages are populated for 88 records across 22 complete population-year distributions — PASS
- Every complete age and counterparty distribution sums to 100%, within numerical precision — PASS
- Road-user and remoteness percentage fields remain empty as intended — PASS
- 2021 First Nations ages 17–25: 686 hospitalisations, approximately 30.90% — PASS
- 2021 non-Indigenous ages 40–64: 12,337 hospitalisations, approximately 33.57% — PASS
- The embedded output CSV matches the dashboard CSV — PASS

## 10. Limitations and discrepancies

Hospitalisation counts represent recorded hospitalisation burden rather than individual injury risk or the number of unique road crashes.

First Nations and non-Indigenous counts exclude cases where Indigenous status was unstated or inadequately described. Their combined total may therefore differ from the overall national total.

Remoteness refers to the patient's usual place of residence rather than the location where the crash occurred. Records with unknown remoteness are excluded. For example, the 2011 First Nations remoteness categories total 1,153 compared with 1,167 overall.

The published 2014 First Nations age total in T3 is 1,407, while T1 reports 1,456. Some age categories are suppressed, so the totals were not artificially forced to reconcile.

Changes in hospital admission practices may affect comparisons across years. Bed-day methodology also requires care when interpreting historical trends.

Incomplete distributions, particularly where suppressed values are present, must not be silently rescaled to 100%.

The four breakdowns represent overlapping views of the same hospitalisation data. Therefore, hospitalisation counts must not be summed across different breakdown_type values.

## 11. Export and reproducibility

CSV exports:

- include column headers;
- exclude KNIME Row IDs;
- use UTF-8 encoding;
- preserve missing values as empty fields.

The final combined dataset is exported as: `first_nations_cleaned.csv`

The saved workflow includes the source Excel workbook and combined CSV in its Data folder. It contains the cleaning, annual aggregation, validation, percentage calculation, long-format integration, final left join and export stages.

Final checks:

- Workflow saved — Confirmed
- Combined dataset contains 462 rows and 10 columns — Confirmed
- Breakdown row-count validation executed — Confirmed
- Combined CSV Writer executed — Confirmed
- Source workbook included in workflow — Confirmed
