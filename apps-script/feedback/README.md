# Momenia feedback Apps Script

This script appends feedback to the existing `Feedback` tab in the Momenia Feedback Responses spreadsheet.

## Deploy

1. Open the feedback spreadsheet and choose **Extensions → Apps Script**.
2. Replace the starter code with [`Code.gs`](./Code.gs), then save.
3. Choose **Deploy → New deployment → Web app**.
4. Set **Execute as** to your account and **Who has access** to **Anyone**, then deploy and authorize the script.
5. Copy the deployed URL ending in `/exec` and use that same URL for `GOOGLE_APPS_SCRIPT_FEEDBACK_URL` in `.env.local`, `.env.staging`, `.env.production`, and the hosted staging/production runtime environment settings.

The web app accepts the JSON payload sent by `/api/feedback` and replies with `{ "ok": true }` after writing the row. `doGet` can be opened in a browser as a basic deployment check.
