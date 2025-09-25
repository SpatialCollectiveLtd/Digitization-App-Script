/**
 * This script provides management with tools to export formatted payment reports.
 */

function exportDailyReport() {
  exportPaymentReport('Daily');
}

function exportWeeklyReport() {
  exportPaymentReport('Weekly');
}

function exportMonthlyReport() {
  exportPaymentReport('Monthly');
}

function exportPaymentReport(timeframe) {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName(SUMMARY_SHEET_NAME);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    ui.alert('Error', `The "${SUMMARY_SHEET_NAME}" sheet has no data to export.`, ui.ButtonSet.OK);
    return;
  }

  ui.alert(`Generating ${timeframe} Report`, 'A new spreadsheet file will be created in your Google Drive.', ui.ButtonSet.OK);

  try {
    const data = sourceSheet.getRange('A2:K' + sourceSheet.getLastRow()).getValues();
    const aggregates = {};

    for (const row of data) {
      const date = new Date(row[0]);
      const username = row[3];
      const buildings = row[5];
      const qualityScore = row[7];
      const basePay = row[8];
      const bonusPay = row[9];
      const totalPay = row[10];
      
      if (!username) continue;

      let key, period;
      if (timeframe === 'Daily') {
        period = date.toLocaleDateString("en-CA");
      } else if (timeframe === 'Weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // Monday as week start
        period = weekStart.toLocaleDateString("en-CA");
      } else { // Monthly
        period = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
      }
      key = period + '|' + username;

      if (!aggregates[key]) {
        aggregates[key] = {
          period, youthId: row[1], fullName: row[2], username, settlement: row[4],
          totalBuildings: 0, totalBasePay: 0, totalBonusPay: 0, totalPay: 0, weightedQualitySum: 0
        };
      }
      
      aggregates[key].totalBuildings += buildings;
      aggregates[key].totalBasePay += basePay;
      aggregates[key].totalBonusPay += bonusPay;
      aggregates[key].totalPay += totalPay;
      aggregates[key].weightedQualitySum += qualityScore * buildings;
    }

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
      ui.alert('No data found to generate the report.');
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const newSheetName = `DPW ${timeframe} Payment Report ${timestamp}`;
    const newSS = SpreadsheetApp.create(newSheetName);
    const reportSheet = newSS.getSheets()[0];
    
    const headers = [
      `${timeframe} Period`, 'Youth ID', 'Full Name', 'OSM Username', 'Settlement',
      'Total Buildings', 'Avg. Quality Score', 'Total Base Pay', 'Total Bonus', 'Total Payment'
    ];
    
    reportSheet.appendRow(headers).getRange("A1:J1").setFontWeight("bold");
    reportSheet.getRange(2, 1, results.length, headers.length).setValues(results);

    reportSheet.getRange(2, 7, results.length, 1).setNumberFormat('0.00%');
    reportSheet.getRange(2, 8, results.length, 3).setNumberFormat('"KES" #,##0.00');
    reportSheet.autoResizeColumns(1, headers.length);

    const url = newSS.getUrl();
    const html = `<html><body><p>Success! Your report is ready.</p><p><a href="${url}" target="_blank">Click here to open the new spreadsheet</a>.</p></body></html>`;
    const htmlOutput = HtmlService.createHtmlOutput(html).setWidth(300).setHeight(100);
    ui.showModalDialog(htmlOutput, 'Report Generated');
  } catch (e) {
    Logger.log(e);
    ui.alert('An Error Occurred', `Failed to generate report. Please check logs. Error: ${e.message}`, ui.ButtonSet.OK);
  }
}