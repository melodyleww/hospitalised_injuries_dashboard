# BITRE Data — Reading Notes

## Source
- URL: https://www.bitre.gov.au/publications/ongoing/hospitalised-injury
- Published: September 2023
- Coverage: 2011–2021 (calendar years)
- Source data: AIHW National Hospital Morbidity Database
- Definition: injury resulting in confirmed admission to hospital,
  but NOT in-hospital death (non-fatal only)
- Unit of observation: one hospital separation (episode of care)

## ⚠️ Critical structural finding
Each file's "raw" tab contains FIVE side-by-side mini-tables,
NOT one long-format table. Must be split in KNIME.

---

## File 1: national_2011_2021.xlsx
- Tabs: Cover, Index, T1..T5(?), raw
- Purpose: National-level counts

## File 2: state_territory_2011_2021.xlsx
- Tabs: Cover, Index, T1, T2, T3, T4, T5, raw
- Summary tabs:
  - T1: Annual counts by state/territory (NSW/Vic/Qld/SA/WA/Tas/NT/ACT/Aus)
  - T2: By road user, per state
  - T3: By sex, per state
  - T4: By age group, per state
  - T5: By counterparty, per state
- raw tab columns (5 blocks):
  - Block 1 (A–F): calendar year | 6-monthly | cause | count | bed days | state
  - Block 2 (H–N): calendar year | 6-monthly | cause | road user | count | bed days | state
  - Block 3 (P–V): calendar year | 6-monthly | cause | sex | count | bed days | state
  - Block 4 (X–AE): calendar year | 6-monthly | cause | age group | count | bed days | state
  - Block 5 (AG–AL): calendar year | 6-monthly | cause | counterparty | count | bed days | state

## File 3: first_nations_2011_2021.xlsx
- Tabs: Cover, Index, T1, T2, T3, T4, T5, raw
- Summary tabs:
  - T1: Annual, First Nations vs Non-Indigenous
  - T2: By road user (both groups)
  - T3: By age group (both groups)
  - T4: By remoteness area
  - T5: By counterparty
- raw tab columns (5 blocks):
  - Block 1 (A–G): calendar year | 6-monthly | cause | FN status | age group | hosp | bed days
  - Block 2 (I–O): ... + road user
  - Block 3 (Q–W): ... + age group
  - Block 4 (Y–AE): ... + remoteness
  - Block 5 (AG–AM): ... + counterparty

---

## Column semantics

### Dimensions
- calendar year: 2011–2021 (integer)
- 6-monthly: "Jan-Jun" or "Jul-Dec" (categorical)
- cause of injury: always "Traffic" in raw (other 5 categories not published)
- state/territory: NSW, Vic, Qld, SA, WA, Tas, NT, ACT (categorical)
- road user: Car driver/passenger/unknown | Motorcyclist | Pedal cyclist |
  Pedestrian | Heavy transport driver/passenger/unknown |
  Pick-up truck or van occupant | Bus occupant | Other or unknown (categorical)
- sex: Male | Female (categorical)
- age group: 0-7 | 8-16 | 17-25 | 26-39 | 40-64 | 65-74 | 75+ (ordinal)
- First Nations status: "First Nations people" | "Non-Indigenous" (categorical)
- remoteness: Major Cities | Regional | Remote (ordinal)
- counterparty: Car/pick-up/van | Fixed/stationary object |
  Non-collision transport accident | Other (categorical)

### Measures
- Hospitalisations / count of cases: integer (cases, non-fatal)
- Bed days: integer (total patient days)

### Special value
- "n.p." = not published (small counts suppressed for confidentiality)
  → MUST be handled in KNIME. Do NOT treat as 0. Either drop or mark null.