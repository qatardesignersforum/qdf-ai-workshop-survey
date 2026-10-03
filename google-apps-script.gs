/*
QDF AI Workshop Survey
Google Apps Script Web App

1. Create a Google Sheet.
2. Open Extensions > Apps Script.
3. Replace the default code with this file.
4. Save.
5. Deploy > New deployment > Web app.
6. Execute as: Me
7. Who has access: Anyone
8. Copy the Web App URL into script.js.
*/

const SHEET_NAME = "Responses";

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Interest",
      "AI Usage",
      "AI Areas",
      "AI Areas - Other",
      "Specific Topic / Skill",
      "Design Experience",
      "Workplace",
      "Full Name",
      "Company / Organization",
      "Job Title / Design Role",
      "Qatar Contact / WhatsApp",
      "Email",
      "Suggestion"
    ]);
    sheet.setFrozenRows(1);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ok:true, message:"QDF survey endpoint is running."}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    setup();

    const data = JSON.parse(e.postData.contents || "{}");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    sheet.appendRow([
      new Date(),
      data.interest || "",
      data.aiUsage || "",
      data.aiAreas || "",
      data.aiAreasOther || "",
      data.specificTopic || "",
      data.designExperience || "",
      data.workplace || "",
      data.fullName || "",
      data.company || "",
      data.jobTitle || "",
      data.whatsapp || "",
      data.email || "",
      data.suggestion || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ok:false, error:String(error)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
