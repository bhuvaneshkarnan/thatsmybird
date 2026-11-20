/**
 * ==============================================================================
 * THAT'S MY BIRD — GOOGLE APPS SCRIPT LEAD INTAKE WEB APP
 * ==============================================================================
 * Connects your landing page lead forms directly to this Google Sheet!
 *
 * HOW TO ACTIVATE IN 60 SECONDS:
 * 1. Open your created spreadsheet:
 *    https://docs.google.com/spreadsheets/d/1Fv549R07SE81bQyMBG7Xjp_yT7pfA-_GDCRWhh_vFck/edit
 * 2. In the top Google Sheets menu, click: Extensions > Apps Script
 * 3. Delete any default code in Code.gs, and paste this ENTIRE file
 * 4. Click the "Save" icon (or Ctrl+S)
 * 5. Click the blue "Deploy" button (top right) > "New deployment"
 * 6. Click the gear icon next to "Select type" > choose "Web app"
 * 7. Set configuration:
 *    - Description: "That's My Bird Lead Intake"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (allows website visitors to submit)
 * 8. Click "Deploy" > "Authorize access" (sign in with your Google account)
 * 9. Copy the generated "Web app URL" (starts with: https://script.google.com/macros/s/...)
 * 10. Paste that URL into `app.js` at line 99:
 *     const GOOGLE_SHEETS_WEBAPP_URL = 'YOUR_COPIED_URL_HERE';
 * ==============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Prevent concurrent write collisions
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName('Flock Leads') || doc.getActiveSheet();

    // Auto-setup professional headers if brand new sheet
    if (sheet.getLastRow() === 0) {
      sheet.setName('Flock Leads');
      var headers = [
        'Timestamp (IST)',
        'Full Name',
        'WhatsApp Number',
        'Delivery Pincode',
        'Form Source',
        'Anti-Spam Status',
        'Device'
      ];
      sheet.appendRow(headers);
      
      // Style headers in Chettinad Bistro Red
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#C33130');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontFamily('Arial');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
      
      // Auto-adjust column widths
      sheet.setColumnWidth(1, 180);
      sheet.setColumnWidth(2, 200);
      sheet.setColumnWidth(3, 170);
      sheet.setColumnWidth(4, 150);
      sheet.setColumnWidth(5, 160);
      sheet.setColumnWidth(6, 160);
      sheet.setColumnWidth(7, 120);
    }

    var params = e.parameter || {};
    
    // Server-side Honeypot Check: Discard if hidden bot field is filled
    if (params._b_hp_check) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: 'spam_blocked' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Format IST Timestamp
    var istDate = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');

    var newRow = [
      istDate,
      params.name || 'Anonymous',
      params.phone ? "'" + params.phone : '', // Prepend apostrophe to preserve leading zeros in phone
      params.pincode ? "'" + params.pincode : '',
      params.source || 'Hero Lead Card',
      params.captcha_status || 'Verified Human',
      params.device || 'Desktop'
    ];

    sheet.appendRow(newRow);

    // Return JSON success
    return ContentService
      .createTextOutput(JSON.stringify({
        result: 'success',
        row: sheet.getLastRow(),
        timestamp: istDate
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        result: 'error',
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'active',
      service: "That's My Bird Lead Intake API",
      message: 'POST to this endpoint with name, phone, pincode, source.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
