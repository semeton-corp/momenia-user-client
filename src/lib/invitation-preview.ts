import type { UserInvitationDetail } from "@/lib/api/user-invitation/user-invitation.types"
import { getGoogleFontsUrl } from "@/lib/fonts"

// Where the editor hands a live (possibly unsaved) invitation snapshot to /preview.
// A tab opened with window.open inherits a copy of sessionStorage at creation time,
// so the snapshot must be written BEFORE the tab is opened.
export const PREVIEW_STORAGE_KEY = "momenia_preview"

// Fallback wallpaper for the desktop-width surround around the phone-shaped invitation,
// used whenever a template doesn't set its own. One shared constant so the public
// invitation page, this renderer, and the editor's desktop preview toggle can't drift
// out of sync on the path.
export const DEFAULT_DESKTOP_BACKGROUND = "/background-default-desktop.png"

// Reserved schema-field key: a template opts into a custom desktop wallpaper by
// declaring an image field with exactly this key (e.g. `{ key: "desktop_background",
// type: "image", ... }` in template.schema.fields). Its value then flows through
// fieldValues/userData like any other field — no separate theme plumbing needed.
export const DESKTOP_BACKGROUND_FIELD_KEY = "desktop_background"

// Card width for every "phone-on-a-desktop-wallpaper" surface — the public invitation
// page, /preview, and the editor's Desktop toggle. One constant so all three stay in
// agreement; the editor mockup is only trustworthy if it's the same width guests get.
//
// Bounded on both sides. Ceiling: stay well under 768px, since at that breakpoint the
// template's own per-section CSS can switch to desktop layouts (e.g. side-by-side
// columns) that this narrow card would then clip — the exact bug this width exists to
// avoid. Floor: sections are authored mobile-first, so dropping under ~430px (a large
// phone) starts cramping content that was never designed to go narrower.
export const DESKTOP_CARD_WIDTH = 440

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

// "2026-08-31" → "August 31, 2026" / "31 Agustus 2026", depending on the invitation
// page's own /id or /en route — not the guest's browser language, which would make the
// same link read differently for two guests. Falls back to the raw value on anything
// unparseable, so a malformed date degrades to "wrong-looking" rather than blank.
function formatDateForLocale(iso: string, locale: string): string {
  if (!iso) return ""
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  try {
    return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { dateStyle: "long" }).format(date)
  } catch {
    return iso
  }
}

// Only the template is needed, so this also accepts the lighter public payload from
// /user-invitations/content/:path_url — not just the full editor detail.
export function buildInvitationHtml(
  invitation: Pick<UserInvitationDetail, "template">,
  userData: Record<string, string>,
  theme: ThemeDefaults,
  sectionOrder: string[],
  locale: string
): string {
  const { template } = invitation
  const allCss = Object.values(template.sectionTypes).map((s) => s.css).join("\n")
  const mainPage = template.pages.find((p) => p.id === "main")
  const coverPage = template.pages.find((p) => p.id === "cover")

  // A field the couple hasn't filled in yet falls back to its schema placeholder, so a
  // half-finished invitation previews as a realistic design instead of blank gaps.
  const placeholders: Record<string, string> = {}
  for (const field of template.schema.fields) {
    if (field.placeholder) placeholders[field.key] = field.placeholder
  }
  const valueFor = (key: string) => userData[key] || placeholders[key] || ""

  // Any schema field typed "date" (currently just event_date) gets its raw ISO value
  // formatted for display — done by key rather than hardcoding "event_date" so a
  // template adding a second date field (e.g. an RSVP deadline) gets this for free.
  const dateFieldKeys = new Set(template.schema.fields.filter((f) => f.type === "date").map((f) => f.key))

  function renderSection(sectionId: string, page: typeof mainPage) {
    const sec = page?.sections.find((s) => s.id === sectionId)
    if (!sec) return ""
    const stype: SectionType = template.sectionTypes[sec.section_type_id]
    if (!stype) return ""
    const source = stype.html
    const html = source.replace(/\{\{([^}]+)\}\}/g, (match, key: string, offset: number) => {
      const value = valueFor(key)

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
      //
      // `all:unset` keeps the wrapper visually invisible. Templates style bare tags
      // (e.g. `.cover span { font: 700 0.72rem }` for a label), which would otherwise
      // hit this injected span and override the real element around it — a headline in
      // an <h1> would render with the label's small red type instead. Inline style beats
      // any stylesheet selector, and every inherited property still comes from the
      // parent, so the text looks exactly as the template intended.
      //
      // Date fields are formatted only here, not in `value` above — an attribute use
      // (e.g. a `datetime="{{event_date}}"` on a <time>) should stay machine-readable ISO.
      const display = dateFieldKeys.has(key) ? formatDateForLocale(value, locale) : value
      return `<span data-field="${key}" style="all:unset">${escapeHtml(display)}</span>`
    })
    return `<div data-section-id="${sec.id}">${html}</div>`
  }

  const coverSections = (coverPage?.sections ?? []).map((s) => renderSection(s.id, coverPage)).join("\n")
  const mainSections = sectionOrder.map((id) => renderSection(id, mainPage)).join("\n")
  const allJs = Object.values(template.sectionTypes).map((s) => s.js).filter(Boolean).join("\n;\n")

  return `<!DOCTYPE html>
<html lang="${escapeAttr(locale)}">
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
/* The cover is a full-screen splash, but templates size it in fixed pixels (e.g.
   min-height:812px, one phone screen). That exactly fills the editor's 812px mockup
   while leaving a band of bare background below it in a real browser window, which is
   taller. Stretching the cover to whatever height it's given fixes every template at
   once, and the template's own min-height still acts as the floor on short screens.
   Deliberately not applied to #page-main — that page scrolls through many sections. */
#page-cover{min-height:100vh;display:flex;flex-direction:column}
#page-cover>[data-section-id]{flex:1 0 auto;display:flex;flex-direction:column}
#page-cover>[data-section-id]>*{flex:1 0 auto}
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
    background-image: url('${userData[DESKTOP_BACKGROUND_FIELD_KEY] || DEFAULT_DESKTOP_BACKGROUND}');
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
// "<" is escaped so a placeholder can't emit a closing script tag and end this
// block early. (Careful: writing that tag literally here would do exactly that.)
window.__memoriaPlaceholders = ${JSON.stringify(placeholders).replace(/</g, "\\u003c")};
window.__memoriaLocale = ${JSON.stringify(locale)};
window.__memoriaDateFields = ${JSON.stringify(Array.from(dateFieldKeys))};
// Mirrors formatDateForLocale() on the host side — needed here too since a live edit
// in the editor updates data-field text via postMessage, not by rebuilding this HTML.
window.__memoriaFormatDate = function(iso) {
  if (!iso) return '';
  var d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(window.__memoriaLocale === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'long' }).format(d);
  } catch (e) {
    return iso;
  }
};
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
      // Same fallback as the initial render, so clearing a field in the editor
      // reverts to its placeholder instead of leaving a blank gap.
      var v = ud[k] || window.__memoriaPlaceholders[k] || '';
      // Same split as the initial render: the raw value (v) goes to img/map src, the
      // display text gets locale-formatted if this key is a date field.
      var display = window.__memoriaDateFields.indexOf(k) !== -1 ? window.__memoriaFormatDate(v) : v;
      document.querySelectorAll('[data-field="'+k+'"]').forEach(function(el){ el.textContent = display; });
      document.querySelectorAll('[data-field-img="'+k+'"]').forEach(function(el){ if(v) el.src = v; });
      // The template's own static src="...?q={{field}}&output=embed" only renders once at
      // build time — this keeps the map preview live as the couple edits the location field,
      // the same way data-field-img keeps a photo live without a full iframe reload.
      document.querySelectorAll('[data-field-map="'+k+'"]').forEach(function(el){
        if(v) el.src = 'https://www.google.com/maps?q=' + encodeURIComponent(v) + '&output=embed';
      });
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

/* ── Guest bridge ───────────────────────────────────────────────────────────
   Turns declarative data-momenia-* attributes in a template into real guest
   behaviour (RSVP + guestbook). Templates never call an API themselves: this
   iframe is sandboxed without allow-same-origin, so its fetches would have an
   opaque origin and be rejected. Instead it posts intent to the host, which
   owns every endpoint URL — so a backend change is one edit in the app rather
   than a data migration across every template row in the database. */
(function(){
  var GUEST = { id: '', name: '', status: '' };

  function when(root, name, on) {
    root.querySelectorAll('[data-momenia-when="' + name + '"]').forEach(function(el){
      el.style.display = on ? '' : 'none';
    });
  }

  function setBusy(form, busy) {
    form.querySelectorAll('button[type="submit"], button:not([type])').forEach(function(b){
      b.disabled = busy;
    });
  }

  function resize() {
    window.parent.postMessage({type:'memoriaResize',height:document.body.scrollHeight},'*');
  }

  // A guest who already answered has no use for the RSVP form. Hides the whole section
  // it sits in (buildInvitationHtml wraps each one in [data-section-id]) rather than
  // just the form, so they aren't left with a "Konfirmasi Kehadiran" heading standing
  // over nothing. Called both for a returning guest (applyGuest, keyed off the status
  // the host reported at load) and right after a fresh submission succeeds this session.
  function setRsvpVisible(visible) {
    document.querySelectorAll('[data-momenia-form="rsvp"]').forEach(function(form){
      var container = form.closest('[data-section-id]') || form;
      container.style.display = visible ? '' : 'none';
    });
  }

  function applyGuest() {
    when(document, 'guest', !!GUEST.id);
    when(document, 'no-guest', !GUEST.id);

    var answered = !!GUEST.id && !!GUEST.status && GUEST.status !== 'not-confirmed';
    setRsvpVisible(!answered);
    // Only overwrite when the name is actually known, so the template's own
    // fallback text ("Tamu Undangan") stays visible otherwise.
    if (GUEST.name) {
      document.querySelectorAll('[data-momenia-text="guestName"]').forEach(function(el){
        el.textContent = GUEST.name;
      });
    }
  }

  function renderMessages(items) {
    document.querySelectorAll('[data-momenia-list="messages"]').forEach(function(list){
      list.querySelectorAll('[data-momenia-rendered]').forEach(function(n){ n.remove(); });
      when(list, 'empty', items.length === 0);

      var tpl = list.querySelector('template[data-momenia-item]');
      if (!tpl) return;

      items.forEach(function(item){
        var node = tpl.content.cloneNode(true).firstElementChild;
        if (!node) return;
        node.setAttribute('data-momenia-rendered', '');
        node.querySelectorAll('[data-momenia-text]').forEach(function(el){
          var val = item[el.getAttribute('data-momenia-text')];
          // Hide rather than print blanks — the API still returns a zero date
          // for messageAt, and an empty voiceNote for text-only messages.
          if (val === undefined || val === null || val === '') { el.style.display = 'none'; return; }
          el.textContent = val;
        });
        list.appendChild(node);
      });
      resize();
    });
  }

  document.addEventListener('submit', function(e){
    var form = e.target && e.target.closest ? e.target.closest('[data-momenia-form]') : null;
    if (!form) return;
    e.preventDefault();

    var kind = form.getAttribute('data-momenia-form');
    var payload = {};

    if (kind === 'message') {
      var box = form.querySelector('[name="message"]');
      payload.message = box ? String(box.value || '').trim() : '';
      if (!payload.message) return;
    } else if (kind === 'rsvp') {
      var st = form.querySelector('[name="status"]');
      var tot = form.querySelector('[name="totalAttendee"]');
      payload.status = st ? st.value : 'present';
      payload.totalAttendee = tot ? (parseInt(tot.value, 10) || 1) : 1;
    } else {
      return;
    }

    when(form, 'success', false);
    when(form, 'error', false);
    when(form, 'sending', true);
    setBusy(form, true);
    window.parent.postMessage({type:'memoriaSubmit',form:kind,payload:payload},'*');
  }, true);

  window.addEventListener('message', function(e){
    if (!e.data) return;

    if (e.data.type === 'memoriaGuest') {
      GUEST.id = e.data.guestInvitationId || '';
      GUEST.name = e.data.guestName || '';
      GUEST.status = e.data.guestStatus || '';
      applyGuest();
      resize();
      // Acked back so the host knows the DOM mutation actually happened before it
      // reveals the iframe — postMessage delivery is async, so "we called post()"
      // and "the child applied it" are two different moments, not one.
      window.parent.postMessage({type:'memoriaGuestApplied'},'*');
      return;
    }

    if (e.data.type === 'memoriaMessages') {
      renderMessages(e.data.messages || []);
      window.parent.postMessage({type:'memoriaMessagesApplied'},'*');
      return;
    }

    if (e.data.type === 'memoriaFormResult') {
      document.querySelectorAll('[data-momenia-form="' + e.data.form + '"]').forEach(function(form){
        setBusy(form, false);
        when(form, 'sending', false);
        when(form, 'success', !!e.data.ok);
        when(form, 'error', !e.data.ok);
        if (e.data.ok) {
          if (e.data.form === 'message') {
            var box = form.querySelector('[name="message"]');
            if (box) box.value = '';
          }
        } else {
          form.querySelectorAll('[data-momenia-error]').forEach(function(el){
            el.textContent = e.data.error || 'Gagal mengirim. Coba lagi.';
          });
        }
      });

      // A successful RSVP collapses the whole section, same as it would on a return
      // visit — no reason to leave a "Konfirmasi Kehadiran" form sitting there once
      // it's already answered. Delayed briefly so the "Terima kasih!" success message
      // actually gets seen instead of being replaced by nothing the instant it appears.
      if (e.data.form === 'rsvp' && e.data.ok) {
        GUEST.status = 'confirmed';
        setTimeout(function(){ setRsvpVisible(false); resize(); }, 1500);
      }

      resize();
    }
  });

  // Start hidden: transient states shouldn't flash before the host reports in.
  document.querySelectorAll('[data-momenia-form]').forEach(function(form){
    when(form, 'success', false);
    when(form, 'error', false);
    when(form, 'sending', false);
  });
  applyGuest();
})();

${allJs}
</script>
</body>
</html>`
}

// Opens the invitation in a new tab via the /preview route. Defaults to the saved
// invitation; the editor passes its live state to preview unsaved edits instead.
export function openInvitationPreview(
  // Only the template body and (optionally) filled-in values are ever read, so a catalog
  // template with no saved invitation behind it can preview itself too — it just falls
  // back to the schema placeholders, which is exactly what a demo should show.
  detail: Pick<UserInvitationDetail, "template"> & { fieldValues?: Record<string, string> },
  locale: string,
  opts?: { userData?: Record<string, string>; theme?: ThemeDefaults; sectionOrder?: string[]; activePage?: string },
): void {
  const userData = opts?.userData ?? detail.fieldValues ?? {}
  const theme = opts?.theme ?? detail.template.theme_defaults
  const sectionOrder =
    opts?.sectionOrder ??
    (detail.template.pages.find((p) => p.id === "main")?.sections ?? []).map((s) => s.id)

  const snapshot: PreviewSnapshot = {
    html: buildInvitationHtml(detail, userData, theme, sectionOrder, locale),
    userData,
    theme,
    activePage: opts?.activePage ?? "main",
  }

  sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(snapshot))
  window.open(`/${locale}/preview`, "_blank")
}
