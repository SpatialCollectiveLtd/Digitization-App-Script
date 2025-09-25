/**
 * @OnlyCurrentDoc
 * This script provides management tools, including a function to log training attendance for a specific date.
 * It now includes a duplicate check, prevents future-date logging, and provides clear user feedback.
 */

function logTrainingAttendance() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('DatepickerDialog')
      .setWidth(300)
      .setHeight(150);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Select Training Date');
}

function processTrainingDate(dateText) {
  const ui = SpreadsheetApp.getUi();
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of today for comparison

  const trainingDate = new Date(dateText);
  if (isNaN(trainingDate.getTime())) {
    throw new Error('The date provided is not valid. Please try again.');
  }
  // Prevent logging for future dates
  if (trainingDate > today) {
    throw new Error('Cannot log attendance for a future date. Please select today or a past date.');
  }
  const formattedDate = trainingDate.toLocaleDateString("en-CA");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const registrySheet = ss.getSheetByName(REGISTRY_SHEET_NAME);
  let attendanceSheet = ss.getSheetByName(ATTENDANCE_SHEET_NAME);

  if (!attendanceSheet) {
    attendanceSheet = ss.insertSheet(ATTENDANCE_SHEET_NAME);
    attendanceSheet.appendRow(['Date', 'OSM_Username', 'Logged_By']);
  }
  
  const loggedForDate = new Set();
  if (attendanceSheet.getLastRow() > 1) {
    const attendanceData = attendanceSheet.getRange('A2:B' + attendanceSheet.getLastRow()).getValues();
    for (const row of attendanceData) {
      const date = new Date(row[0]).toLocaleDateString("en-CA");
      if (date === formattedDate) {
        loggedForDate.add(row[1]);
      }
    }
  }

  const registryData = registrySheet.getRange('A2:G' + registrySheet.getLastRow()).getValues();
  const allTrainees = registryData.filter(row => row[6] === 'In Training');
  
  const traineesToLog = allTrainees.filter(trainee => !loggedForDate.has(trainee[2]));
  const managerEmail = Session.getActiveUser().getEmail();

  if (traineesToLog.length === 0) {
    ui.alert('No new entries were added.', `All ${allTrainees.length} trainees have already been logged for ${formattedDate}.`, ui.ButtonSet.OK);
    return;
  }

  const newRows = traineesToLog.map(trainee => [formattedDate, trainee[2], managerEmail]);
  attendanceSheet.getRange(attendanceSheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  
  ui.alert('Success!', `Attendance has been logged for ${traineesToLog.length} new trainees for ${formattedDate}. ${loggedForDate.size} trainees were already logged and were skipped.`, ui.ButtonSet.OK);
}