/**
 * @OnlyCurrentDoc
 * This script provides management with tools to export formatted payment reports.
 * It adds a custom menu to the spreadsheet UI.
 */

/**
 * Runs when the spreadsheet is opened to add the custom "Export Reports" menu.
 */
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('Export Reports')
      .addItem('Export Daily Summary Report', 'exportDailyReport')
      .addItem('Export Weekly Summary Report', 'exportWeeklyReport')
      .addItem('Export Monthly Summary Report', 'exportMonthlyReport')
      .addToUi();
}

// --- Menu Item Functions ---
function exportDailyReport() {
  exportPaymentReport('Daily');
}

function exportWeeklyReport() {
  exportPaymentReport('Weekly');
}

function exportMonthlyReport() {
  exportPaymentReport('Monthly');
}

/**
 * Main function to generate and export a payment report as a new spreadsheet.
 * @param {string} timeframe The period to report on: 'Daily', 'Weekly', or 'Monthly'.
 */
function exportPaymentReport(timeframe) {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName('Daily_Performance_Summary');

  if (!sourceSheet) {
    ui.alert('Error', 'The source sheet "Daily_Performance_Summary" was not found.', ui.ButtonSet.OK);
    return;
  }

  ui.alert(`Generating ${timeframe} Report`, 'A new spreadsheet file will be created in your Google Drive.', ui.ButtonSet.OK);

  try {
    const data = sourceSheet.getRange('A2:K' + sourceSheet.getLastRow()).getValues();
    const aggregates = {};

    // --- 1. Aggregate the daily data based on the selected timeframe ---
    for (const row of data) {
      const date = new Date(row[0]);
      const username = row[3];
      const buildings = row[5];
      const qualityScoreSum = row[7] * buildings; // Weighted quality score
      const basePay = row[8];
      const bonusPay = row[9];
      const totalPay = row[10];
      
      if (!username) continue;

      let key;
      if (timeframe === 'Daily') {
        key = date.toLocaleDateString("en-CA") + '|' + username;
      } else if (timeframe === 'Weekly') {
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        key = weekStart.toLocaleDateString("en-CA") + '|' + username;
      } else { // Monthly
        key = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '|' + username;
      }

      if (!aggregates[key]) {
        aggregates[key] = {
          period: key.split('|')[0],
          youthId: row[1],
          fullName: row[2],
          username: username,
          settlement: row[4],
          totalBuildings: 0,
          totalBasePay: 0,
          totalBonusPay: 0,
          totalPay: 0,
          weightedQualitySum: 0
        };
      }
      
      aggregates[key].totalBuildings += buildings;
      aggregates[key].totalBasePay += basePay;
      aggregates[key].totalBonusPay += bonusPay;
      aggregates[key].totalPay += totalPay;
      aggregates[key].weightedQualitySum += qualityScoreSum;
    }

    // --- 2. Prepare the final report data ---
    const results = [];
    for (const key in aggregates) {
      const agg = aggregates[key];
      const avgQuality = agg.totalBuildings > 0 ? agg.weightedQualitySum / agg.totalBuildings : 0;
      results.push([
        agg.period, agg.youthId, agg.fullName, agg.username, agg.settlement,
        agg.totalBuildings, avgQuality, agg.totalBasePay, agg.totalBonusPay, agg.totalPay
      ]);
    }
    
    if (results.length === 0) {
      ui.alert('No data found for the selected period.');
      return;
    }

    // --- 3. Create a new spreadsheet and write the report ---
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const newSheetName = `DPW ${timeframe} Payment Report ${timestamp}`;
    const newSS = SpreadsheetApp.create(newSheetName);
    const reportSheet = newSS.getSheets()[0];
    
    const headers = [
      `${timeframe} Period`, 'Youth ID', 'Full Name', 'OSM Username', 'Settlement',
      'Total Buildings', 'Avg. Quality Score', 'Total Base Pay', 'Total Bonus', 'Total Payment'
    ];
    
    reportSheet.appendRow(headers).getRange("A1:J1").setFontWeight("bold");
    reportSheet.getRange(2, 1, results.length, headers.length).setValues(results);

    // Formatting
    reportSheet.getRange(2, 7, results.length, 1).setNumberFormat('0.00%');
    reportSheet.getRange(2, 8, results.length, 3).setNumberFormat('"KES" #,##0.00');
    reportSheet.autoResizeColumns(1, headers.length);

    // --- 4. Provide a link to the new report file ---
    const url = newSS.getUrl();
    const html = `<html><body><p>Success! Your report has been generated.</p><p><a href="${url}" target="_blank">Click here to open the report</a>.</p></body></html>`;
    const htmlOutput = HtmlService.createHtmlOutput(html).setWidth(300).setHeight(100);
    ui.showModalDialog(htmlOutput, 'Report Generated');

  } catch (e) {
    Logger.log(e);
    ui.alert('An Error Occurred', `Failed to generate report. Please check logs. Error: ${e.message}`, ui.ButtonSet.OK);
  }
}