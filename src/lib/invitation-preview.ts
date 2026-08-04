import type { UserInvitationDetail } from "@/lib/api/user-invitation/user-invitation.types"
import { getGoogleFontsUrl } from "@/lib/fonts"

// Where the editor hands a live (possibly unsaved) invitation snapshot to /preview.
// A tab opened with window.open inherits a copy of sessionStorage at creation time,
// so the snapshot must be written BEFORE the tab is opened.
export const PREVIEW_STORAGE_KEY = "momenia_preview"

export type PreviewSnapshot = {
  html: string
  userData: Record<string, string>
  theme: Record<string, string>
  activePage: string
}

type SectionType = UserInvitationDetail["template"]["sectionTypes"][string]
export type ThemeDefaults = UserInvitationDetail["template"]["theme_defaults"]

// Values are interpolated into an HTML string that the iframe re-parses from srcdoc,
// so they need escaping — otherwise a `&` in an image query string gets mangled and a
// stray `"` or `<` closes the attribute/tag early and corrupts the rest of the markup.
function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function buildInvitationHtml(
  detail: UserInvitationDetail,
  userData: Record<string, string>,
  theme: ThemeDefaults,
  sectionOrder: string[]
): string {
  const { template } = detail
  const allCss = Object.values(template.sectionTypes).map((s) => s.css).join("\n")
  const mainPage = template.pages.find((p) => p.id === "main")
  const coverPage = template.pages.find((p) => p.id === "cover")

  function renderSection(sectionId: string, page: typeof mainPage) {
    const sec = page?.sections.find((s) => s.id === sectionId)
    if (!sec) return ""
    const stype: SectionType = template.sectionTypes[sec.section_type_id]
    if (!stype) return ""
    const source = stype.html
    const html = source.replace(/\{\{([^}]+)\}\}/g, (match, key: string, offset: number) => {
      const value = userData[key] || ""

      // A placeholder can sit either in an element's body (`<h1>{{headline}}</h1>`) or
      // inside an attribute (`src="{{photo}}"`, `alt="{{bride_name}}"`). Emitting a tag
      // into the attribute case nests a tag inside an attribute and breaks the parser —
      // that's what leaked `" alt="">` / `<span data-field="` onto the page. Scan back to
      // the nearest angle bracket: an unclosed `<` means we're still inside a tag.
      const before = source.slice(0, offset)
      const insideTag = before.lastIndexOf("<") > before.lastIndexOf(">")
      if (insideTag) return escapeAttr(value)

      // Body context: wrap so `memoriaUpdate` can retarget it as the user types. The
      // template supplies data-field-img on its own <img>, so images never need this.
      return `<span data-field="${key}">${escapeHtml(value)}</span>`
    })
    return `<div data-section-id="${sec.id}">${html}</div>`
  }

  const coverSections = (coverPage?.sections ?? []).map((s) => renderSection(s.id, coverPage)).join("\n")
  const mainSections = sectionOrder.map((id) => renderSection(id, mainPage)).join("\n")
  const allJs = Object.values(template.sectionTypes).map((s) => s.js).filter(Boolean).join("\n;\n")

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link href="${getGoogleFontsUrl(theme.font_title, theme.font_body)}" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --color-primary:${theme.color_primary};
  --color-accent:${theme.color_accent};
  --color-background:${theme.color_background};
  --font-title:'${theme.font_title}',Georgia,serif;
  --font-body:'${theme.font_body}',system-ui,sans-serif;
}
body{font-family:var(--font-body);background:var(--color-background);color:var(--color-primary);}
${allCss}
@media (min-width: 768px) {
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  html {
    background-color: #1a1a1a;
    background-image: url('${theme.backgroundImage || "/background-default-desktop.png"}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
  }
  body {
    display: flex;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    background: transparent;
    flex-direction: row;
    pointer-events: auto;
  }
  #page-cover, #page-main {
    max-width: 420px;
    width: 100%;
    height: 100%;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 10;
    position: relative;
    pointer-events: auto;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
</head>
<body>
<div id="page-cover" data-page="cover">${coverSections}</div>
<div id="page-main" data-page="main" style="display:none">${mainSections}</div>
<script>
window.__memoriaGoTo = function(pageId) {
  document.querySelectorAll('[data-page]').forEach(function(el){
    el.style.display = el.dataset.page === pageId ? '' : 'none';
  });
  // The invitation's own buttons (e.g. "Let's Party") call this directly, so the
  // editor has to be told which page is showing — otherwise its page indicator,
  // content list and field groups stay stuck on the previous page.
  window.parent.postMessage({type:'memoriaPageChange',pageId:pageId},'*');
  window.parent.postMessage({type:'memoriaResize',height:document.body.scrollHeight},'*');
};
window.addEventListener('message', function(e) {
  if (!e.data) return;
  if (e.data.type === 'memoriaGoTo') { window.__memoriaGoTo(e.data.pageId); return; }
  if (e.data.type === 'memoriaUpdate') {
    var ud = e.data.userData || {};
    var th = e.data.theme || {};
    Object.keys(ud).forEach(function(k){
      document.querySelectorAll('[data-field="'+k+'"]').forEach(function(el){ el.textContent = ud[k] || ''; });
      document.querySelectorAll('[data-field-img="'+k+'"]').forEach(function(el){ if(ud[k]) el.src = ud[k]; });
    });
    if(th.color_primary) document.documentElement.style.setProperty('--color-primary', th.color_primary);
    if(th.color_accent)  document.documentElement.style.setProperty('--color-accent',  th.color_accent);
    if(th.color_background) document.documentElement.style.setProperty('--color-background', th.color_background);
    if(th.font_title) document.documentElement.style.setProperty('--font-title', "'"+th.font_title+"',Georgia,serif");
    if(th.font_body) document.documentElement.style.setProperty('--font-body', "'"+th.font_body+"',system-ui,sans-serif");
    window.parent.postMessage({type:'memoriaResize',height:document.body.scrollHeight},'*');
  }
});
window.parent.postMessage({type:'memoriaResize',height:document.body.scrollHeight},'*');
${allJs}
</script>
</body>
</html>`
}

// Opens the invitation in a new tab via the /preview route. Defaults to the saved
// invitation; the editor passes its live state to preview unsaved edits instead.
export function openInvitationPreview(
  detail: UserInvitationDetail,
  locale: string,
  opts?: { userData?: Record<string, string>; theme?: ThemeDefaults; sectionOrder?: string[]; activePage?: string },
): void {
  const userData = opts?.userData ?? detail.fieldValues ?? {}
  const theme = opts?.theme ?? detail.template.theme_defaults
  const sectionOrder =
    opts?.sectionOrder ??
    (detail.template.pages.find((p) => p.id === "main")?.sections ?? []).map((s) => s.id)

  const snapshot: PreviewSnapshot = {
    html: buildInvitationHtml(detail, userData, theme, sectionOrder),
    userData,
    theme,
    activePage: opts?.activePage ?? "main",
  }

  sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(snapshot))
  window.open(`/${locale}/preview`, "_blank")
}
