# Hospitalised Injuries from Road Crashes in Australia

COS30045 Data Visualisation Project — interactive D3 web visualisation.

## Team
- <Chok Li En> (<105684522>)
- <Tan Yi Chin> (<105685017>)
- <Eva Lew Tze Ling> (<105685143>)

## Structure
- `index.html` — landing page
- `css/` — styles
- `js/` — D3 code (config, data loading, charts, interactions)
- `data/raw/` — original BITRE datasets
- `data/processed/` — cleaned exports from KNIME
- `knime/` — KNIME workflow (.knwf)

## Data source
BITRE Hospitalised Injury Data:
https://www.bitre.gov.au/publications/ongoing/hospitalised-injury

## Setup
Open `index.html` in a browser, or run a local server:
```bash
python3 -m http.server 8000