/* =========================================================================
   AstroLaabh — Gemstone Efficacy Meter — LEAD CAPTURE → GOOGLE SHEET
   Google Apps Script that receives lead-form submissions and appends one row
   per lead to a spreadsheet.

   ─────────────────────────────────────────────────────────────────────────
   ONE-TIME SETUP (≈5 minutes)
   ─────────────────────────────────────────────────────────────────────────
   1. Create a new Google Sheet (sheet.new). Name it e.g. "Gemstone Leads".
   2. In that Sheet: Extensions → Apps Script. Delete any starter code.
   3. Paste EVERYTHING in this file into the editor. Save (💾).
   4. Click "Deploy" → "New deployment".
        • Type (gear icon) → "Web app"
        • Description: "Gemstone lead capture"
        • Execute as:  Me
        • Who has access:  Anyone            ← important
        • Click "Deploy", then "Authorize access" and allow the permissions.
   5. Copy the "Web app URL" it gives you (ends in /exec).
   6. Open  src/app.js  and paste that URL into:
        const LEAD_ENDPOINT = 'PASTE_URL_HERE';
   7. Done. Submit a test lead from the results page — a row appears in the Sheet.

   To view leads: just open the Sheet (the "Leads" tab). Export via
   File → Download → CSV/Excel any time.

   NOTE: If you ever change/redeploy, use "Manage deployments" → edit the
   existing one (pencil) → "New version", so the URL stays the same.
   ========================================================================= */

const SHEET_NAME = 'Leads';

// Column order for the header row. Any keys sent by the app that aren't
// listed here get appended as extra columns automatically.
const COLUMNS = [
  'timestamp', 'name', 'contact',
  'stone', 'vedicName', 'planet',
  'efficacyPercent', 'verdict',
  'origin', 'treatment', 'light_transmission', 'luster',
  'carat', 'certification', 'metal', 'finger', 'energising',
  'pageUrl',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // serialize writes so concurrent submits don't clash
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Build/extend the header row.
    let headers = sheet.getLastRow() > 0
      ? sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].filter(String)
      : COLUMNS.slice();
    if (headers.length === 0) headers = COLUMNS.slice();
    Object.keys(data).forEach(function (k) {
      if (headers.indexOf(k) === -1) headers.push(k);
    });
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Append the lead in header order.
    const row = headers.map(function (h) {
      return Object.prototype.hasOwnProperty.call(data, h) ? data[h] : '';
    });
    sheet.appendRow(row);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Simple GET so you can confirm the deployment is live in a browser.
function doGet() {
  return json({ ok: true, service: 'gemstone-lead-capture' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
