/**
 * Handles HTTP GET requests.
 * This function fetches all OSM usernames from the 'Youth_Registry' sheet
 * and returns them as a JSON array. This is used by the JOSM plugin
 * to get a list of authorized mappers.
 */
function doGet(e) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName('Youth_Registry');
    // Get all values from the third column (C), starting from the second row.
    var usernames = sheet.getRange('C2:C' + sheet.getLastRow()).getValues();
    
    // Flatten the 2D array into a 1D array and filter out any empty cells.
    var userList = usernames.map(function(row) { return row[0]; }).filter(String);

    // Return the list as a JSON string.
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'users': userList }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    Logger.log(e);
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'message': e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles HTTP POST requests.
 * This function receives validation data from the JOSM plugin,
 * verifies the users, and logs the data to the 'Validation_Log' sheet.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = doc.getSheetByName('Validation_Log');
    var registrySheet = doc.getSheetByName('Youth_Registry');
    var rawData = e.postData.contents;
    Logger.log("Received data: " + rawData); // Add this line for debugging
    var data = JSON.parse(rawData);
    
    // --- START: Server-Side Security Check ---
    var registryUsernames = registrySheet.getRange('C2:C' + registrySheet.getLastRow()).getValues()
                                         .flat().filter(String);
                                         
    var data = JSON.parse(e.postData.contents);

    // Check 1: Is the mapper in the registry?
    if (registryUsernames.indexOf(data.mapper_username) === -1) {
      throw new Error('Unauthorized Mapper: The user "' + data.mapper_username + '" is not registered in the project.');
    }
    
    // Check 2: Is the validator in the registry?
    if (registryUsernames.indexOf(data.validator_username) === -1) {
       throw new Error('Unauthorized Validator: The user "' + data.validator_username + '" is not registered in the project.');
    }
    // --- END: Server-Side Security Check ---

    var timestamp = new Date();

    var newRow = [
      timestamp,
      data.task_id,
      data.settlement,
      data.mapper_username,
      data.validator_username,
      data.total_buildings,
      data.error_hanging_nodes,
      data.error_overlapping_buildings,
      data.error_buildings_crossing_highway,
      data.error_missing_tags,
      data.error_improper_tags,
      data.error_features_misidentified,
      data.error_missing_buildings,
      data.error_building_inside_building,
      data.error_building_crossing_residential,
      data.error_improperly_drawn,
      data.validation_status,
      data.validator_comments
    ];

    logSheet.appendRow(newRow);
    lock.releaseLock();

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': logSheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    Logger.log(e);
    lock.releaseLock();
    // Return a specific, meaningful error message to the JOSM plugin
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'message': e.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}