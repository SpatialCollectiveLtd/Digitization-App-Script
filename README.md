# DPW Digitization Workflow Automation — v1

This repository contains the first (v1) release of the DPW automation workflow: a Google Apps Script project (bound to a Google Sheet) that logs validation submissions, de-duplicates and summarizes daily mapper performance, generates payment reports, and exposes a simple dashboard for managers.

This v1 commit captures the original automation logic and UI used in production for the DPW project.

## What’s included (high level)

- Server endpoints for integrations (e.g., `doGet` / `doPost`) that are used by external tools (JOSM plugin).
- Validation log ingestion and server-side security checks to ensure mappers/validators are registered.
- The automation engine (`runAutomatedDailySummary`) that de-duplicates validation entries (keeps the most recent per Task ID), computes quality and pay, and writes `Daily_Performance_Summary`.
- Report export utilities that allow generation of Daily/Weekly/Monthly payment reports as new Google Sheets.
- A simple, client-side dashboard (`Dashboard.html`) built with Google Charts and a `DateRangeDialog.html` modal used to request ad-hoc report generation.

## Files of interest

- `code.gs` — core API endpoints and glue code between the spreadsheet, web UI, and external integrations.
- `AutomationEngine.gs` — daily automation and payment logic (de-duplication and pay calculations).
- `ReportExporter.gs` — custom menu & report export helpers.
- `Dashboard.html` & `DateRangeDialog.html` — HTMLService files used for the dashboard and date-range report dialog.
 - `Configuration.gs` — centralized configuration constants (sheet names, targets, pay amounts).
 - `Menu.gs` — single entrypoint for custom spreadsheet menus (adds DPW Tools menu and submenus).
 - `ManagementTools.gs` — management utilities (e.g., `logTrainingAttendance()` and `processTrainingDate()`), with attendance logging, duplicate checks, and UI dialogs.
 - `DatepickerDialog.html` — small modal used by the Management tools to select a training date.

## Quick deploy & verification (Google Apps Script)

1. Open the Google Sheet that will host this project.
2. Open Extensions → Apps Script and create a new Apps Script project (or use the existing bound script).
3. Copy/paste the `.gs` files (`code.gs`, `AutomationEngine.gs`, `ReportExporter.gs`) into the Apps Script editor and add the two HTML files as HTML service assets (`Dashboard.html`, `DateRangeDialog.html`).
4. From the Apps Script editor, save all files and run the following manual checks:
    - Run `onOpen` once to register the "Export Reports" menu.
    - Run `runAutomatedDailySummary` manually to test the summary generation (use a copy of your spreadsheet for testing).
5. Configure triggers:
    - Install an `onFormSubmit` trigger for the form submission handler (if using a Google Form).
    - Optionally add a time-driven trigger (daily) for `runAutomatedDailySummary`.

## Repository

This repository contains the v1 release of the DPW automation workflow. The code in this project is intended to be managed through your normal version control and deployment processes. The maintainers should push this initial commit to the organization remote and create the appropriate release tag (for example: `v1.0.0`).

## README additions for maintainers / deployers

- Verify the sheet tab names: `Youth_Registry` (or `Official_Participant_List`), `Validation_Log`, and `Daily_Performance_Summary` exist and have expected columns.
- Confirm the Google Form (if any) maps form answers to the expected columns in `Validation_Log`.
- The dashboard calls a server function `getDashboardData()`; ensure it exists in `code.gs` (or update the UI to call the correct function name).

### New/updated toolkit notes

- Configuration has been centralized to `Configuration.gs` — change constants there instead of scattering magic values across files. This reduces merge conflicts and makes future updates safer.
- All UI menu registrations now live in `Menu.gs` (single `onOpen()` hook). Management features (attendance logging) are implemented in `ManagementTools.gs` and use `DatepickerDialog.html` for the modal UI.
- `ReportExporter.gs` now gracefully handles empty summary sheets and aggregates by the selected timeframe.

## Verification checklist (minimal)

1. Dashboard loads without JS errors and shows data (if `Daily_Performance_Summary` contains rows).
2. `runAutomatedDailySummary` completes successfully and writes aggregated rows to `Daily_Performance_Summary`.
3. Clicking Export Reports → Export Daily Summary Report creates a new Google Sheet and returns a link.

<!-- Next steps removed by request -->

## Licensing recommendation (company data)

Because this repository operates on company data (personally-identifiable information and payroll-related data), treat the code and the data with care:

- Code: It's normal to keep the repository under the company's private organization account (as you have). For the code license, choose a permissive license only if you plan to share the code publicly (e.g., MIT or Apache-2.0). If the code should remain internal or you want to restrict reuse, consider a private license or keep the repo private and omit a public open-source license.
- Data: Never commit actual company or personal data to the repository. Keep all spreadsheets and exports in Google Drive and out of Git history. If you need test data, add synthetic or anonymized fixtures.
- Recommended approach for this repo: keep the repository private (do not add a public open-source license). If you must add a license file for internal governance, use a short COMPANY-LICENSE.md explaining permitted use (or Apache-2.0 with an explicit note that data must remain private). I can add a templated COMPANY-LICENSE.md if you want.

## Contact / Issues

For questions or to report issues, open an issue on the GitHub repo or contact the maintainers listed in project metadata.

---
_This README was updated as part of preparing the v1 release and to include push/deploy instructions for Windows PowerShell users._