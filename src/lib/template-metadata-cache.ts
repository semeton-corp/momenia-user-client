import type { InvitationTemplate, TemplateDetailResponse } from "@/lib/api/invitation-template/invitation-template.types"

const STORAGE_KEY = "momenia:feedback-template-metadata:v1"
const MAX_ENTRIES = 100

export type TemplateMetadata = {
  id: string
  name: string
}

type StoredTemplateMetadata = TemplateMetadata & {
  fingerprint: string
  structureFingerprint?: string
  layoutFingerprint?: string
  savedAt: number
}

type TemplateMetadataSource = TemplateMetadata & {
  template: InvitationTemplate
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null"
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`

  const record = value as Record<string, unknown>
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(",")}}`
}

function fingerprintTemplate(template: InvitationTemplate): string {
  const serialized = stableSerialize(template)
  let first = 0x811c9dc5
  let second = 0x9e3779b9

  for (let index = 0; index < serialized.length; index += 1) {
    const code = serialized.charCodeAt(index)
    first = Math.imul(first ^ code, 0x01000193)
    second = Math.imul(second ^ code, 0x85ebca6b)
  }

  return `${(first >>> 0).toString(16)}-${(second >>> 0).toString(16)}-${serialized.length.toString(36)}`
}

// Invitations can retain the selected template's page/section structure while
// editable styling and markup differ from the catalog response. Use this
// conservative fallback only when it points to one unique catalog template.
function fingerprintTemplateStructure(template: InvitationTemplate): string {
  return stableSerialize({
    pages: template.pages.map((page) => ({
      id: page.id,
      sections: page.sections.map((section) => ({ id: section.id, typeId: section.section_type_id })),
    })),
    fields: template.schema.fields.map((field) => ({ key: field.key, type: field.type, section: field.section })),
  })
}

// Some invitation records regenerate page and section instance IDs. Match the
// reusable layout and schema as a final local fallback, still requiring a unique
// candidate so we never attribute feedback to an arbitrary template.
function fingerprintTemplateLayout(template: InvitationTemplate): string {
  return stableSerialize({
    pages: template.pages.map((page) => page.sections.map((section) => section.section_type_id)),
    fields: template.schema.fields.map((field) => ({ key: field.key, type: field.type, section: field.section })),
    sectionTypes: Object.keys(template.sectionTypes).sort(),
  })
}

function readStoredMetadata(): StoredTemplateMetadata[] {
  if (typeof window === "undefined") return []

  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")
    if (!Array.isArray(value)) return []

    return value.filter((entry): entry is StoredTemplateMetadata =>
      typeof entry === "object" && entry !== null &&
      typeof (entry as StoredTemplateMetadata).fingerprint === "string" &&
      typeof (entry as StoredTemplateMetadata).id === "string" &&
      typeof (entry as StoredTemplateMetadata).name === "string" &&
      typeof (entry as StoredTemplateMetadata).savedAt === "number",
    )
  } catch {
    return []
  }
}

export function rememberTemplateMetadata(detail: TemplateDetailResponse): void {
  rememberTemplateMetadataSource(detail.id, detail.name, detail.template)
}

export function rememberTemplateMetadataSource(id: string, name: string, template: InvitationTemplate): void {
  const normalizedId = typeof id === "string" ? id.trim() : ""
  const normalizedName = typeof name === "string" ? name.trim() : ""
  if (typeof window === "undefined" || !normalizedId || !normalizedName || !template) return

  const fingerprint = fingerprintTemplate(template)
  const structureFingerprint = fingerprintTemplateStructure(template)
  const layoutFingerprint = fingerprintTemplateLayout(template)
  const next: StoredTemplateMetadata[] = [
    {
      fingerprint,
      structureFingerprint,
      layoutFingerprint,
      id: normalizedId,
      name: normalizedName,
      savedAt: Date.now(),
    },
    ...readStoredMetadata().filter((entry) => entry.id !== normalizedId),
  ].slice(0, MAX_ENTRIES)

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Feedback still works if browser storage is unavailable or full.
  }
}

export function getTemplateMetadataForTemplate(template: InvitationTemplate): TemplateMetadata | null {
  const fingerprint = fingerprintTemplate(template)
  const stored = readStoredMetadata()
  const exact = uniqueMetadata(stored.filter((entry) => entry.fingerprint === fingerprint))
  if (exact) return exact

  const structureFingerprint = fingerprintTemplateStructure(template)
  const structural = uniqueMetadata(stored.filter((entry) => entry.structureFingerprint === structureFingerprint))
  if (structural) return structural

  const layoutFingerprint = fingerprintTemplateLayout(template)
  return uniqueMetadata(stored.filter((entry) => entry.layoutFingerprint === layoutFingerprint))
}

export function findTemplateMetadataInSources(
  template: InvitationTemplate,
  sources: Array<TemplateMetadataSource | undefined>,
): TemplateMetadataSource | null {
  const fingerprint = fingerprintTemplate(template)
  const exact = uniqueSource(sources.filter((source): source is TemplateMetadataSource =>
    Boolean(source?.template && fingerprintTemplate(source.template) === fingerprint),
  ))
  if (exact) return exact

  const structureFingerprint = fingerprintTemplateStructure(template)
  const structural = uniqueSource(sources.filter((source): source is TemplateMetadataSource =>
    Boolean(source?.template && fingerprintTemplateStructure(source.template) === structureFingerprint),
  ))
  if (structural) return structural

  const layoutFingerprint = fingerprintTemplateLayout(template)
  return uniqueSource(sources.filter((source): source is TemplateMetadataSource =>
    Boolean(source?.template && fingerprintTemplateLayout(source.template) === layoutFingerprint),
  ))
}

function uniqueMetadata(matches: StoredTemplateMetadata[]): TemplateMetadata | null {
  const unique = new Map(matches.map((entry) => [`${entry.id}\u0000${entry.name}`, entry]))
  if (unique.size !== 1) return null
  const match = unique.values().next().value as StoredTemplateMetadata | undefined
  return match ? { id: match.id, name: match.name } : null
}

function uniqueSource(matches: TemplateMetadataSource[]): TemplateMetadataSource | null {
  const unique = new Map(matches.map((source) => [`${source.id}\u0000${source.name}`, source]))
  if (unique.size !== 1) return null
  return unique.values().next().value ?? null
}
