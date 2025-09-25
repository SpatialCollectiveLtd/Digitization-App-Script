Development & Test Harness — DPW Automation

This document explains how to run local tests and a simple harness inside Google Apps Script for the DPW automation logic.

1. Purpose

- Provide a reproducible way to validate `runAutomatedDailySummary()` logic on synthetic data without touching production sheets.

2. Quick steps

- Create a new Apps Script project (bound or unbound) and add the repository files.
- Create a test script file `TestHarness.gs` (example below) and paste the sample harness.

3. Sample Test Harness (paste into a `.gs` file)

```javascript
function runSummaryWithMockData() {
  // Mock logs: [timestamp, taskId, settlement, mapperUsername, validatorUsername, totalBuildings, ...errors..., validationStatus, comments]
  const mockLog = [
    [new Date('2025-09-25T09:00:00Z'), 'T1', 'SettlementA', 'alice', 'validator1', 150, 0,0,0,0,0,0,0,0,0, 'Validated', 'OK'],
    [new Date('2025-09-25T12:00:00Z'), 'T2', 'SettlementA', 'alice', 'validator2', 60, 1,0,0,0,0,0,0,0,0, 'Validated', 'OK'],
    [new Date('2025-09-25T11:00:00Z'), 'T3', 'SettlementB', 'bob', 'validator1', 210, 2,1,0,0,0,0,0,0,0, 'Validated', 'OK']
  ];

  // Mock registry: [youthId, fullName, osmUsername, settlement]
  const mockRegistry = [
    ['Y001','Alice Example','alice','SettlementA'],
    ['Y002','Bob Example','bob','SettlementB']
  ];

  // Call the aggregation logic directly if refactored into a separate function, or simulate sheet reads/writes.
  // For quick validation, you can temporarily replace the sheet reads in `AutomationEngine.gs` with these mock arrays and run the function.
  Logger.log('Mock harness ready - follow the comments to run safely.');
}
```

4. Notes

- Always run tests on a copy of real spreadsheets or use a dedicated test spreadsheet.
- The harness intentionally uses synthetic data and illustrative examples — extend it to cover edge cases (timestamps, zero buildings, malformed rows).

---

If you'd like, I can create the `TestHarness.gs` file automatically and wire a `runTests` entry in `Menu.gs` for easy execution inside Apps Script.
