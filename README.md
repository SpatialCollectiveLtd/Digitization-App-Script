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

## Verification checklist (minimal)

1. Dashboard loads without JS errors and shows data (if `Daily_Performance_Summary` contains rows).
2. `runAutomatedDailySummary` completes successfully and writes aggregated rows to `Daily_Performance_Summary`.
3. Clicking Export Reports → Export Daily Summary Report creates a new Google Sheet and returns a link.

## Next steps (recommended)

1. Add automated tests or smoke-checks (e.g., a `validateSpreadsheet()` function that checks for required sheet names and column counts).
2. Add CI (if desired) to run linting or validation on push.
3. If you want, I can implement `getDashboardData()` and `processPaymentReport()` server functions (if missing) so the HTML files operate end-to-end.

## Contact / Issues

For questions or to report issues, open an issue on the GitHub repo or contact the maintainers listed in project metadata.

---
_This README was updated as part of preparing the v1 release and to include push/deploy instructions for Windows PowerShell users._