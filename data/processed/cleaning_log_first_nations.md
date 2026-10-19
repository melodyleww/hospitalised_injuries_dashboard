# Cleaning Log — First Nations Data

## 1. Source and ownership

- Source: `data/raw/first_nations_2011_2021.xlsx`
- Worksheet: `raw`
- KNIME workflow: `first_nations_clean.knmf`
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

The retained breakdowns describe overlapping hospitalisations. Their counts were kept separate to avoid double counting.

## 3. Column names and data types

Column names were standardised to:

- `year`
- `half_year`
- `first_nations_status`
- `age_group`, `road_user`, `remoteness` or `counterparty`
- `hospitalisations`
- `bed_days`

Year was stored as an integer. Categories were retained as text, and hospitalisations and bed days were stored as numeric values.

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

For age and road user, annual measures were retained only when both distinct half-years were present and both measure values were numeric. Otherwise, the annual measure remained missing.

The 2011 First Nations bus-occupant group had only one half-year record. Its annual measures remained missing.

For remoteness and counterparty, annual sums were used directly after confirming complete coverage and numeric values across all groups.

- Remoteness completeness check: All 66 annual groups contained two distinct half-years and two numeric values for both hospitalisations and bed days. Suppression counts were zero — PASS
- Counterparty completeness check: All 88 annual groups contained two distinct half-years and two numeric values for both hospitalisations and bed days. Suppression counts were zero — PASS

## 7. Output files

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

## 8. Validation results

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

## 9. Limitations and discrepancies

Hospitalisation counts describe recorded burden rather than individual injury risk or unique crashes.

First Nations and non-Indigenous counts exclude unstated or inadequately described status, so their sum may differ from the overall national total.

Remoteness describes usual residence, not crash location. Unknown remoteness is excluded. The 2011 First Nations remoteness counts therefore total 1,153, compared with 1,167 overall.

The published 2014 First Nations age total in T3 is 1,407, while T1 reports 1,456. Suppressed age categories are present. Totals were not forced to reconcile.

Changes in admission practices affect historical comparisons. Bed-day methodology also requires care when comparing years.

Incomplete age distributions must not be silently rescaled to 100%.

## 10. Export and reproducibility

Exports include column headers, exclude Row IDs, use UTF-8 encoding and preserve missing values as empty fields.

Final checks:

- Workflow saved: [Confirm].
- Export paths and filenames checked: [Confirm].
- Workflow rerun successfully from the source: [Confirm].
- Validation screenshots saved: [Confirm].
