const SPREADSHEET_ID = "1EftyH_ZwROVTrjthGyyzQ5zUXmxlnd5tXRH-sUgPsYQ"
const SHEET_NAME = "Feedback"
const HEADERS = [
  "submittedAt",
  "rating",
  "comment",
  "invitationId",
  "templateId",
  "templateName",
  "locale",
  "environment",
]

function doPost(event) {
  const lock = LockService.getScriptLock()
  let hasLock = false

  try {
    lock.waitLock(10000)
    hasLock = true

    const body = event && event.postData && event.postData.contents
    const payload = JSON.parse(body || "{}")
    const row = normalizeFeedback(payload)
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME)

    if (!sheet) throw new Error("feedback_sheet_not_found")

    const actualHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0]
    if (actualHeaders.join("\t") !== HEADERS.join("\t")) {
      throw new Error("feedback_headers_mismatch")
    }

    sheet.appendRow(row)
    return jsonResponse({ ok: true })
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || "feedback_write_failed" })
  } finally {
    if (hasLock) lock.releaseLock()
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: "momenia-feedback" })
}

function normalizeFeedback(payload) {
  if (!payload || typeof payload !== "object") throw new Error("invalid_payload")

  const rating = Number(payload.rating)
  const invitationId = requireText(payload.invitationId, 200)
  const comment = optionalText(payload.comment, 500)
  const templateId = optionalText(payload.templateId, 200)
  const templateName = optionalText(payload.templateName, 200)
  const locale = payload.locale
  const environment = payload.environment
  const submittedAt = payload.submittedAt ? new Date(payload.submittedAt) : new Date()

  if (!Number.isInteger(rating) || rating < 1 || rating > 10) throw new Error("invalid_rating")
  if (locale !== "id" && locale !== "en") throw new Error("invalid_locale")
  if (!["development", "staging", "production"].includes(environment)) {
    throw new Error("invalid_environment")
  }
  if (Number.isNaN(submittedAt.getTime())) throw new Error("invalid_submitted_at")

  return [
    submittedAt,
    rating,
    safeCellText(comment),
    safeCellText(invitationId),
    safeCellText(templateId),
    safeCellText(templateName),
    locale,
    environment,
  ]
}

function requireText(value, maxLength) {
  if (typeof value !== "string") throw new Error("invalid_text")
  const text = value.trim()
  if (!text || text.length > maxLength) throw new Error("invalid_text")
  return text
}

function optionalText(value, maxLength) {
  if (value === null || value === undefined || value === "") return ""
  if (typeof value !== "string" || value.length > maxLength) throw new Error("invalid_text")
  return value.trim()
}

function safeCellText(value) {
  const text = String(value)
  return /^[=+\-@]/.test(text) ? "'" + text : text
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON)
}
