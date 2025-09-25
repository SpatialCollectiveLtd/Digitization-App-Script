/**
 * @OnlyCurrentDoc
 * This is the single, master function that creates all custom menus for the project.
 */
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('DPW Tools')
      .addSubMenu(SpreadsheetApp.getUi().createMenu('Management')
          .addItem("Log Today's Training Attendance", 'logTrainingAttendance'))
      .addSeparator()
      .addSubMenu(SpreadsheetApp.getUi().createMenu('Export Reports')
          .addItem('Export Daily Summary Report', 'exportDailyReport')
          .addItem('Export Weekly Summary Report', 'exportWeeklyReport')
          .addItem('Export Monthly Summary Report', 'exportMonthlyReport'))
      .addToUi();
}