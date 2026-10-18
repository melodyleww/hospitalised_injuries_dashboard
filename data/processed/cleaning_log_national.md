# Cleaning Log — National File

## 1. File name and owner
- File: national_2011_2021.xlsx
- Owner: <Your Name>

## 2. Row count before and after cleaning
- Before (raw): 117,919
- After filtering Traffic: 86,140
- After GroupBy (annual totals): 9,039

## 3. Column count before and after cleaning
- Before: 13
- After: 11 (year, jurisdiction, first_nations_status, remoteness, age_group, sex, road_user, counterparty, hospitalisations, bed_days, data_quality_flag)

## 4. Transformations applied
- Filtered `Cause of injury` to keep only "Traffic"
- Merged `65-74` and `75+` into `65+` age group
- Renamed columns to match Data Contract schema
- Standardised labels for Remoteness, Sex, Road User, and Counterparty
- Aggregated monthly data into annual totals (GroupBy Sum)
- Added `jurisdiction` = "Australia"
- Added `first_nations_status` = "Unknown"

## 5. Count of n.p. values converted to NA
- 0 (National file had no suppressed n.p. values)

## 6. Count of blank cells converted to NA
- 0

## 7. Count of duplicate rows removed
- 0 (Resolved automatically via GroupBy aggregation)

## 8. Discrepancies found
- ABS population data was not provided in the Data Dictionary. As a result, the `rate_per_100k` column was omitted from this file.

## 9. Validation check results
- 2011 National Total: Expected 34,033 / Actual: 34,033 (PASS)
- 2021 National Total: Expected 39,505 / Actual: 39,505 (PASS)