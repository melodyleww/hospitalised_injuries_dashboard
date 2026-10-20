# Cleaning Log — First Nations Data

## 1. Source and ownership

- Source: `data/raw/first_nations_2011_2021.xlsx`
- Worksheet: `raw`
- KNIME workflow: `first_nations_clean.knwf`
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

- `age_group`
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

## 7. Long-format integration

After the four breakdowns were cleaned and aggregated independently, additional branches were created from each final annual dataset.
Column Renamer nodes standardised the category field to category, and Constant Value Column nodes added the breakdown_type field.
The resulting branch dimensions were:

- Age: 132 rows × 9 columns
- Road user: 176 rows × 9 columns
- Remoteness: 66 rows × 9 columns
- Counterparty: 88 rows × 9 columns
  The four datasets were then vertically combined using Concatenate nodes.
  The final combined First Nations dataset contained:
  462 rows × 9 columns
  The combined dataset retains the following structure:
- year
- first_nations_status
- category
- half_years_present
- hospitalisations_suppressed_count
- bed_days_suppressed_count
- hospitalisations
- bed_days
- breakdown_type
  The datasets were concatenated vertically rather than joined horizontally because the four breakdowns represent different analytical dimensions and do not have a one-to-one relationship between individual rows.

## 8. Output files

The final annual outputs are:

- `first_nations_age_clean.csv`: 132 rows and 8 columns.
- `first_nations_road_user_clean.csv`: 176 rows and 8 columns.
- `first_nations_remoteness_clean.csv`: 66 rows and 8 columns.
- `first_nations_counterparty_clean.csv`: 88 rows and 8 columns.

Each output retains these data-quality fields:

- `half_years_present`
- `hospitalisations_suppressed_count`
- `bed_days_suppressed_count`

Temporary aggregation columns were removed from the final exports but remain available upstream in KNIME.

Actual exported dimensions checked: [Confirm].

## 9. Validation results

Age:

- The 2011 First Nations age counts matched T3: 92, 204, 335, 286, 226 and 24, totalling 1,167 — PASS.
- The 2014 First Nations 0–7 and 65+ hospitalisation values remained missing, matching T3 suppression — PASS.

Road user:

- Selected 2011 First Nations counts matched T2: car occupants 617, motorcyclists 187, pedal cyclists 121 and pedestrians 180 — PASS.
- The 2011 First Nations bus-occupant group had one half-year record and missing final annual measures — PASS.

Remoteness:

- Expected 2011 First Nations counts: Major Cities 368, Regional 455 and Remote 330.
- Comparison with T4: The 2011 First Nations Major Cities 368, Regional 455, Remote 330, Total 1153 — PASS

Counterparty:

- Expected 2011 First Nations counts: 391, 192, 362 and 222, totalling 1,167.
- Comparison with T5: The 2011 First Nations [car, pick-up truck or van] 391, [Fixed or stationary object] 192, [Non-collision transport accident] 362, [Other ] 222 — PASS

Additional years and non-Indigenous records checked: [Record results].

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

The latest KNIME workflow contains the source Excel workbook within the saved workflow and includes the full cleaning, aggregation, validation, long-format transformation and export process.

Final checks:

- Workflow saved — Confirmed
- Combined dataset contains 462 rows — Confirmed
- Breakdown row-count validation executed — Confirmed
- Combined CSV Writer executed — Confirmed
- Source workbook included in workflow — Confirmed
