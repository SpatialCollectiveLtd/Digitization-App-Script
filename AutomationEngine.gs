/**
 * The final, all-in-one automation engine for the DPW project.
 * It is status-aware and processes both performance and training data.
 */

function runAutomatedDailySummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const registrySheet = ss.getSheetByName(REGISTRY_SHEET_NAME);
  const logSheet = ss.getSheetByName(LOG_SHEET_NAME);
  const summarySheet = ss.getSheetByName(SUMMARY_SHEET_NAME);
  let attendanceSheet = ss.getSheetByName(ATTENDANCE_SHEET_NAME);

  if (!registrySheet || !logSheet || !summarySheet) {
    Logger.log("Critical Error: A required sheet was not found.");
    return;
  }
  
  const userRegistry = {};
  const registryData = registrySheet.getRange('A2:G' + registrySheet.getLastRow()).getValues();
  for (const row of registryData) {
    const osmUsername = row[2];
    if (osmUsername) {
      userRegistry[osmUsername] = { youthId: row[0], fullName: row[1], settlement: row[3], status: row[6] };
    }
  }

  const dailyAggregates = {};

  if (attendanceSheet && attendanceSheet.getLastRow() > 1) {
    const attendanceData = attendanceSheet.getRange('A2:B' + attendanceSheet.getLastRow()).getValues();
    for (const row of attendanceData) {
      const date = new Date(row[0]).toLocaleDateString("en-CA");
      const username = row[1];
      const key = date + '|' + username;
      if (userRegistry[username] && userRegistry[username].status === 'In Training') {
        dailyAggregates[key] = { type: 'Training', date, username, totalBuildings: 0, totalErrors: 0 };
      }
    }
  }

  const logData = logSheet.getLastRow() > 1 ? logSheet.getRange('A2:R' + logSheet.getLastRow()).getValues() : [];
  for (const row of logData) {
    const timestamp = new Date(row[0]);
    const username = row[3];
    const buildings = Number(row[5]) || 0;
    const validationStatus = (row[16] || '').toString().trim();
    const user = userRegistry[username];

    if (!user || user.status === 'Terminated' || validationStatus !== 'Validated') continue;

    const date = timestamp.toLocaleDateString("en-CA");
    const key = date + '|' + username;
    
    if (dailyAggregates[key] && dailyAggregates[key].type === 'Training') continue;

    let totalErrors = 0;
    for (let i = 6; i <= 15; i++) { totalErrors += Number(row[i]) || 0; }

    if (!dailyAggregates[key]) {
      dailyAggregates[key] = { type: 'Performance', date, username, totalBuildings: 0, totalErrors: 0 };
    }
    dailyAggregates[key].totalBuildings += buildings;
    dailyAggregates[key].totalErrors += totalErrors;
  }

  const results = [];
  for (const key in dailyAggregates) {
    const data = dailyAggregates[key];
    const user = userRegistry[data.username];
    
    let basePay = 0, qualityBonus = 0, volumeMet = 'N/A', qualityScore = 0;

    if (user.status === 'In Training') {
        basePay = BASE_PAY_AMOUNT;
        volumeMet = 'N/A - Training';
    } else if (user.status === 'Active') {
        volumeMet = data.totalBuildings >= DAILY_VOLUME_TARGET ? 'Yes' : 'No';
        basePay = volumeMet === 'Yes' ? BASE_PAY_AMOUNT : 0;
        qualityScore = data.totalBuildings > 0 ? 1 - (data.totalErrors / data.totalBuildings) : 0;
        if (basePay > 0) {
            if (qualityScore >= 0.9) qualityBonus = basePay * 0.30;
            else if (qualityScore >= 0.7) qualityBonus = basePay * 0.20;
            else if (qualityScore >= 0.6) qualityBonus = basePay * 0.10;
        }
    }

    results.push([
      data.date, user.youthId, user.fullName, data.username, user.settlement,
      data.totalBuildings, volumeMet, qualityScore, basePay, qualityBonus, basePay + qualityBonus
    ]);
  }

  if (summarySheet.getLastRow() > 1) {
    summarySheet.getRange('A2:K' + summarySheet.getLastRow()).clearContent();
  }
  if (results.length > 0) {
    results.sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : a[2].localeCompare(b[2])));
    summarySheet.getRange(2, 1, results.length, results[0].length).setValues(results);
    summarySheet.getRange(2, 8, results.length, 1).setNumberFormat('0.00%');
    summarySheet.getRange(2, 9, results.length, 3).setNumberFormat('"KES" #,##0.00');
  }
}