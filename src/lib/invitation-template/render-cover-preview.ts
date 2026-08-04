import type { UserInvitationDetail } from "@/lib/api/user-invitation/user-invitation.types"

type Template = UserInvitationDetail["template"]

const FIELD_TOKEN_PATTERN = /\{\{(\w+)\}\}/g

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// Nilai theme dipakai literal di dalam <style>, bukan lewat atribut HTML —
// buang karakter yang bisa "kabur" dari deklarasi CSS (mis. font name aneh).
function sanitizeCssValue(value: string): string {
  return value.replace(/[{}<>;]/g, "").trim()
}

/**
 * Susun satu dokumen HTML mandiri dari halaman "cover" template undangan,
 * dengan placeholder {{field_key}} diganti isi fieldValues (atau placeholder
 * skema kalau belum diisi). Dipakai buat preview thumbnail di dashboard,
 * dirender lewat sandboxed <iframe srcDoc>.
 *
 * Return null kalau halaman/section "cover" tidak ditemukan di template.
 */
export function buildCoverPreviewHtml(
  template: Template,
  fieldValues: Record<string, string>
): string | null {
  const coverPage = template.pages.find((page) => page.id === "cover")
  if (!coverPage || coverPage.sections.length === 0) return null

  const placeholderByKey = new Map(template.schema.fields.map((field) => [field.key, field.placeholder ?? ""]))

  const substitute = (raw: string) =>
    raw.replace(FIELD_TOKEN_PATTERN, (_, key: string) => {
      const value = fieldValues[key] || placeholderByKey.get(key) || ""
      return escapeHtml(value)
    })

  const sectionsHtml = coverPage.sections
    .map((section) => template.sectionTypes[section.section_type_id])
    .filter((sectionType): sectionType is Template["sectionTypes"][string] => Boolean(sectionType))
    .map((sectionType) => `<style>${sectionType.css}</style>${substitute(sectionType.html)}`)
    .join("")

  if (!sectionsHtml) return null

  const theme = template.theme_defaults
  const themeVars = `
    --font-body: '${sanitizeCssValue(theme.font_body)}', sans-serif;
    --font-title: '${sanitizeCssValue(theme.font_title)}', serif;
    --color-accent: ${sanitizeCssValue(theme.color_accent)};
    --color-primary: ${sanitizeCssValue(theme.color_primary)};
    --color-background: ${sanitizeCssValue(theme.color_background)};
  `

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      :root { ${themeVars} }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; width: 396px; height: 846px; overflow: hidden; }
      body { font-family: var(--font-body); }
    </style>
  </head>
  <body>${sectionsHtml}</body>
</html>`
}
