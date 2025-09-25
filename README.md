<!-- README: DPW Digitization Workflow Automation (Interactive v1) -->

# DPW Digitization Workflow Automation — v1

[![Repo Status](https://img.shields.io/badge/status-stable-green)](https://github.com/SpatialCollectiveLtd/Digitization-App-Script)
[![License](https://img.shields.io/badge/license-Spatial_Collective-lightgrey)](LICENSE.md)

This repository contains the v1 automation workflow used by Spatial Collective's Digitization Project (DPW). It's a Google Apps Script project bound to a Google Sheet that ingests validation logs, computes daily performance and pay, and provides exportable reports and a dashboard for management.

Table of contents
- [What's included](#whats-included)
- [Files of interest](#files-of-interest)
- [Quick deploy & verification](#quick-deploy--verification)
- [Verification checklist](#verification-checklist)
- [License summary](#license-summary)
- [Contact & support](#contact--support)

---

## What's included
<details>
<summary>Click to expand</summary>

- Server endpoints for integrations (`doGet` / `doPost`) used by external tools (e.g., a JOSM plugin).
- Validation log ingestion and server-side verification of mapper/validator membership.
- `AutomationEngine.gs`: daily aggregation and pay calculation logic (aggregates by date + mapper).
- `ReportExporter.gs`: exports daily/weekly/monthly payment reports to new Google Sheets.
- `Dashboard.html` and `DateRangeDialog.html`: dashboard UI (Google Charts) and a modal dialog for report date ranges.

</details>

## Files of interest

| File | Purpose |
|---|---|
| `Configuration.gs` | Centralized constants (sheet names, pay/target values). |
| `code.gs` | Web endpoints and integration handlers (`doGet`, `doPost`). |
| `AutomationEngine.gs` | Aggregates validated logs by date+user and computes pay. |
| `ReportExporter.gs` | Generates exportable payment reports. |
| `Menu.gs` | Single `onOpen()` entry for spreadsheet menus. |
| `ManagementTools.gs` | Management utilities (attendance logging). |
| `Dashboard.html` | Web UI that renders the Google Charts dashboard. |
| `DateRangeDialog.html` / `DatepickerDialog.html` | Modal dialogs used for date selection. |

---

## Quick deploy & verification (Google Apps Script)

1. In Google Sheets: Extensions → Apps Script → create a new (or use existing) bound project.
2. Add the `.gs` files and HTML assets from this repo into the Apps Script editor.
3. Save and run `onOpen()` once to register the custom menus.
4. Test `runAutomatedDailySummary()` manually on a copy of your spreadsheet to verify aggregation/outputs.
5. Install triggers: form submission handler (if using Google Forms) and a daily time-driven trigger for the summary function.

Tip: Keep the repository private. Never commit PII or payroll data into Git; use synthetic fixtures for tests.

---

## Verification checklist

1. Dashboard loads without JavaScript errors and shows data (if `Daily_Performance_Summary` contains rows).
2. `runAutomatedDailySummary` completes successfully and writes aggregated rows to `Daily_Performance_Summary`.
3. Export Reports → Export Daily Summary Report creates a new Google Sheet and returns a link.

---

## License summary

This project is governed by the internal Spatial Collective license (see `LICENSE.md`). The repo is intended to remain private and should not contain company or personal data.

---

## Contact & support

If you need help or want me to implement additional features (tests, CI, dashboard wiring), open an issue or ping the maintainers.

---
_This README is written to be compact and actionable for internal developer use._
