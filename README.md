# QDF AI Workshop Survey

A mobile-friendly QDF-branded survey that sends submissions to Google Sheets through Google Apps Script.

## Files

- `index.html` — survey page
- `style.css` — QDF visual styling
- `script.js` — form logic and Google Apps Script connection
- `qdf-logo.png` — QDF logo used on the survey
- `google-apps-script.gs` — backend script for Google Sheets

## Google Sheet setup

1. Create a new Google Sheet in Google Drive.
2. Open **Extensions → Apps Script**.
3. Copy the contents of `google-apps-script.gs` into the Apps Script editor.
4. Save the project.
5. Run `setup` once from the Apps Script editor and authorize it.
6. Click **Deploy → New deployment**.
7. Select **Web app**.
8. Set **Execute as:** Me.
9. Set **Who has access:** Anyone.
10. Deploy and copy the Web App URL.
11. Open `script.js`.
12. Replace:
   `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`
   with your Web App URL.
13. Upload the website files to GitHub.
14. Enable GitHub Pages.

## Important

Keep the Google Apps Script URL in `script.js` only. Do not put Google account passwords, API keys, or private credentials in the website.

The survey intentionally uses `no-cors` for the POST request to avoid a browser preflight. The Google Apps Script receives and stores the submission in the Sheet.

## Suggested GitHub structure

qdf-ai-workshop-survey/
├── index.html
├── style.css
├── script.js
├── google-apps-script.gs
└── README.md

## Branding
The survey uses the supplied QDF logo and a brand-inspired orange/yellow + maroon + charcoal visual palette.
