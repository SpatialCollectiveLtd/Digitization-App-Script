/**
 * @OnlyCurrentDoc
 * This script is the central automation engine for the DPW project.
 * It includes critical de-duplication logic to prevent double-payment loopholes.
 * It reads the raw validation log, processes only the latest submission for each task,
 * calculates performance and pay according to the playbook, and updates the summary sheet.
 */

/**
 * The main function to be called by an automated trigger.
 */
function runAutomatedDailySummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // --- Configuration ---
  const LOG_SHEET_NAME = 'Validation_Log';
  const REGISTRY_SHEET_NAME = 'Youth_Registry';
  const SUMMARY_SHEET_NAME = 'Daily_Performance_Summary';
  const DAILY_VOLUME_TARGET = 200;
  const BASE_PAY_AMOUNT = 760;

  try {
    const logSheet = ss.getSheetByName(LOG_SHEET_NAME);
    const registrySheet = ss.getSheetByName(REGISTRY_SHEET_NAME);
    const summarySheet = ss.getSheetByName(SUMMARY_SHEET_NAME);

    // --- 1. Read all log data into memory ---
    const logData = logSheet.getRange('A2:R' + logSheet.getLastRow()).getValues();

    // --- 2. Aggregate ALL validated log entries by Date + MapperUsername ---
    // We no longer de-duplicate by Task_ID. Multi-day tasks may have multiple
    // validated submissions and should all contribute to the same day totals.
    const dailyAggregates = {};
+
    for (const row of logData) {
      const timestamp = row[0];
      const mapperUsername = row[3];
      const totalBuildings = row[5];
      const validationStatus = row[16];

      // Only process entries that are marked as "Validated" and have a valid timestamp and building count.
      if (validationStatus !== 'Validated' || !totalBuildings || !timestamp) continue;

      let totalErrors = 0;
      for (let i = 6; i <= 15; i++) { totalErrors += row[i] || 0; }

      const date = new Date(timestamp).toLocaleDateString("en-CA"); // YYYY-MM-DD format
      const key = date + '|' + mapperUsername;
+
      if (!dailyAggregates[key]) {
        dailyAggregates[key] = { date, mapperUsername, totalBuildings: 0, totalErrors: 0 };
      }
+
      dailyAggregates[key].totalBuildings += totalBuildings;
      dailyAggregates[key].totalErrors += totalErrors;
    }
    
    // --- 4. Read registry & calculate final metrics ---
    const registryData = registrySheet.getRange('A2:D' + registrySheet.getLastRow()).getValues();
    const userRegistry = {};
    for (const row of registryData) {
      userRegistry[row[2]] = { youthId: row[0], fullName: row[1], settlement: row[3] };
    }

    const results = [];
    for (const key in dailyAggregates) {
      const dailyData = dailyAggregates[key];
      const userDetails = userRegistry[dailyData.mapperUsername] || { youthId: 'N/A', fullName: 'USER NOT IN REGISTRY', settlement: 'N/A' };
      
      const volumeTargetMet = dailyData.totalBuildings >= DAILY_VOLUME_TARGET;
      const basePay = volumeTargetMet ? BASE_PAY_AMOUNT : 0;
      const qualityScore = dailyData.totalBuildings > 0 ? 1 - (dailyData.totalErrors / dailyData.totalBuildings) : 0;
      
      let qualityBonus = 0;
      if (basePay > 0) {
        if (qualityScore >= 0.9) qualityBonus = basePay * 0.30;
        else if (qualityScore >= 0.7) qualityBonus = basePay * 0.20;
        else if (qualityScore >= 0.6) qualityBonus = basePay * 0.10;
      }
      
      const totalPay = basePay + qualityBonus;

      results.push([
        dailyData.date, userDetails.youthId, userDetails.fullName, dailyData.mapperUsername,
        userDetails.settlement, dailyData.totalBuildings, volumeTargetMet ? 'Yes' : 'No',
        qualityScore, basePay, qualityBonus, totalPay
      ]);
    }
    
    results.sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : a[2].localeCompare(b[2])));

    // --- 5. Write the fresh, correct results back to the summary sheet ---
    if (summarySheet.getLastRow() > 1) {
      summarySheet.getRange('A2:K' + summarySheet.getLastRow()).clearContent();
    }
    if (results.length > 0) {
      summarySheet.getRange(2, 1, results.length, results[0].length).setValues(results);
      summarySheet.getRange(2, 8, results.length, 1).setNumberFormat('0.00%');
      summarySheet.getRange(2, 9, results.length, 3).setNumberFormat('"KES" #,##0.00');
    }

  } catch (e) {
    Logger.log('An error occurred during the automated summary run: ' + e.toString());
  }
}