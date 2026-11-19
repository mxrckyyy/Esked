# Esked — Final UI/UX Design Specification

**Status:** Design specification only. No implementation authorized.
**Branch:** main (Phase A/B/C work is committed in `98eee2a`; this specification document is the only untracked file).
**Prepared from:** Phase 0–8 + Phase A (tokens/theme) + Phase B (component redesign) + Phase C (responsive) + comprehensive audit.

This document is the concrete, owner-approved design specification. It is specific enough to guide implementation without requiring OpenCode to invent missing layout decisions.

---

## A. Executive Summary

Esked is a functional, offline-first PWA (React 18 + Vite + Tailwind v4) that converts a student's class schedule into a phone wallpaper. Phases 0–8, A, B, and C are implemented: tokens, light/dark themes, component redesign, responsive layout. Tests pass (156), lint clean, build succeeds, no horizontal overflow at 320–1440.

The remaining work is design-quality: composition, hierarchy, accessibility, and state completeness. This specification selects **Concept 1 — Focused Single-Column** as the target layout and defines exact header, schedule, toolbar, subject list, dialogs, states, responsive behavior, design system, HCI/a11y requirements, and a 4-phase roadmap (D–G). No new features are introduced.

---

## B. Repository and Implementation Findings

### Verified facts
- No router; tabs are `useState` in `App.jsx` (`schedule`/`customize`/`preview`).
- Storage: IndexedDB (`esked-db`), autosave debounced ~400ms, serialized save chain, in-memory fallback.
- Components: `App`, `ScheduleView`, `SubjectCard`, `SubjectForm`, `QuickAddModal`, `SettingsPanel`, `PreviewCanvas`, `Modal`/`EmptyState`, plus PWA components.
- Theme: `useTheme` hook, `localStorage['esked:theme']`, FOUC script, semantic tokens in `src/index.css` with `.dark`, `@theme` registration. Wallpaper theme (`schedule.settings.theme`) is independent.
- CDP verification: no horizontal overflow at 320/360/390/430/768/1024/1440; theme toggle/persistence/OS fallback work; modals open without overflow at 320.
- Accessibility gaps: heading order (`h1`→`h3`), no skip link, `window.confirm` for delete, static banners not announced, tab buttons use `aria-current` not tablist, form errors not field-linked, no `role="img"` on canvas, no live region for export status.

### Existing reusable components and patterns
- `Modal` (focus trap, restore, Esc, scroll lock) — keep, do not migrate to `<dialog>`.
- `EmptyState` (dashed border card) — reuse but add variants.
- Token utility classes: `bg-canvas`, `bg-surface`, `bg-surface-raised`, `text-ink`, `text-ink-2`, `text-ink-3`, `border-line`, `border-line-strong`, `bg-accent`, `text-accent-ink`, `bg-danger/10`, `text-danger`, `bg-warn/10`, `text-warn`, `focus:ring-focus`.
- Touch target minimum 44px (documented).

---

## C. Approved Design Decisions

| Area | Decision |
|---|---|
| Main layout | Concept 1 — Focused Single-Column |
| Schedule list | Main visual anchor |
| Schedule identity | Quiet secondary section |
| Subject actions | Grouped immediately above subject list |
| Add Subject | Primary action |
| Mobile header | Two deliberate levels (brand+toggle row, then full-width segmented nav) |
| Desktop header | Compact horizontal layout |
| Delete interaction | Accessible confirmation dialog (no undo) |
| Empty states | Separate first-use and storage-error states |
| Skip link | Include |
| Heading hierarchy | Correct semantic order |
| Live regions | Include for relevant status messages |
| Form errors | Associate with corresponding fields |
| Navigation semantics | Use `<nav>` with buttons + `aria-current`; NOT an ARIA tablist (see §M) |
| Customization live preview beside settings | Defer (keep separate views) |
| Typography | Remove Roboto from font stack |
| Content width | Test 672px as initial target, expand if awkward |
| New features | None |
| Implementation | Not authorized |

---

## D. Final Design Principles

1. **One focal point per screen.** Schedule list is the anchor; everything else is secondary.
2. **Proximity over boxes.** Group actions near the list with spacing before adding borders.
3. **One dimension at a time for hierarchy.** Size for headings, weight for emphasis, color for metadata, space for grouping.
4. **Restraint.** No shadows except overlays; no gradients; no decorative icons; no animation beyond state changes.
5. **Conventions over art direction.** App-mode: canvas/surface split, 14px data grid, one accent, shadows only on overlays.
6. **Accessibility is structural.** Semantic HTML first; ARIA only where native elements insufficient.
7. **Mobile-first.** Design at 320 first, enhance upward.
8. **Equal attention to both themes.** Every component must be verified in light and dark.

---

## E. Final Application Header Specification

### Wide desktop (≥1024px) — centered wide container
- **Height:** 56px (same as single-row header).
- **Max width:** `--content-wide` (1024px), centered.
- **Horizontal padding:** 32px (`--space-8`).
- **Layout:** Single row: `[Brand] ... [Nav segmented] [Theme toggle]`. No wrapping; if space is insufficient at 768–1023, nav remains inline but gaps reduce to 8px.
- **Brand:** "Esked" wordmark (text-xl, font-semibold, ink) + optional subtitle (text-sm, ink-3) hidden below 768. No logo image (none exists).
- **Nav:** Segmented control, 3 items (Schedule / Customize / Preview), 44px interactive height (visible 40px + 4px vertical padding, or min-h-44), radius 6, active filled `accent`/`accent-ink`, inactive bordered.
- **Theme toggle:** 44×44, at far right, `shrink-0`.
- **Transition at 768px:** switch from two-level to single-row; subtitle appears; nav becomes inline.

### Tablet (768–1023px)
- **Height:** 56px (same as desktop).
- **Layout:** Single row: `[Brand] [Nav] [Toggle]`, space-between, no wrapping. Gaps 12px.
- **Nav:** 44px height, items flex with equal width (min 80px each). No horizontal scroll.

### Mobile (<768px) — two levels
**Level 1 (brand + toggle):**
- Height: 48px.
- Layout: flex, space-between. Brand left, toggle right.
- Padding: 16px horizontal, 8px top, 4px bottom.

**Level 2 (segmented nav):**
- Height: 44px (interactive target; visible 40px + padding).
- Layout: full-width segmented control, 3 equal-width items (`flex-1` each, min-width 0).
- Gap between levels: 8px.
- Padding: 16px horizontal, 4px top, 8px bottom.

**Total mobile header height:** 48 + 8 + 44 = 100px (including inter-level gap). No additional margins.

**Touch targets:** all nav items ≥44px height (level 2 items are 44px). Theme toggle 44×44. Brand is not interactive.

**Overflow:** nav items must not scroll horizontally; if 3 items don't fit at 320px, reduce nav font to 13px (not below 12px) and horizontal padding to 8px. Do not hide items.

### Breakpoints
- `<768`: two-level header (100px total).
- `768–1023`: single-row header (56px).
- `≥1024`: single-row header, max-width 1024px, centered (56px).

### Behavior at specific widths
- **640px:** still mobile (two-level). Identity inputs become two-column at ≥640 (separate from header).
- **768px:** switch to single-row header; nav inline; subtitle visible.
- **1024px:** centered container (max 1024); no layout change beyond centering.

---

## F. Final Schedule Screen Specification

### Section order (top to bottom)
1. Header (§E).
2. System/PWA notices (install, update, iOS, offline, storage warning, error, form error) — stacked with a defined priority order (see §F notice priority). Critical errors are never suppressed.
3. Schedule identity section.
4. Subject-management toolbar.
5. Subject list (or empty state).
6. Footer (save status, aria-live).

### Notice priority and coexistence rule
Notices stack vertically with 8px gaps. Priority order (highest first):
1. Storage failure / data-loss risk (always visible, `role="alert"`).
2. Form validation errors (`role="alert"`).
3. Offline indicator.
4. Update available (reload needed).
5. Install prompt.
6. iOS install instructions.

Rules:
- Critical errors (storage failure, validation) are never suppressed or auto-dismissed.
- Non-critical notices (install, update, iOS) may be dismissed; dismissal persists for the session.
- At most one non-critical notice should be visible at a time; if multiple are eligible, show the highest-priority one.
- Notices never overlap content or each other; they push content down (no fixed positioning).

### Schedule identity section
- **Purpose:** Name the schedule and semester. Secondary to the list.
- **Position:** Top of content, below notices.
- **Width:** Full content width.
- **Alignment:** Left.
- **Spacing:** 16px below header; 24px below identity before toolbar.
- **Typography:** Title input `text-lg font-semibold`; semester `text-sm`.
- **Visual priority:** Quiet — inputs use `bg-surface`, `border-line-strong`, no large heading. Label above each (`text-xs font-medium text-ink-3`).
- **Surface:** `bg-surface`, radius 6, no shadow.
- **Responsive:** Two-column grid at ≥640px (`sm:grid-cols-2`); single column below. Inputs `max-w-md` (title) / full (semester).
- **Light/dark:** token-driven.

### Subject-management toolbar
- **Purpose:** Show count + grouped actions; primary action dominant.
- **Position:** Immediately above subject list.
- **Width:** Full content width.
- **Spacing:** 8px above list.
- **Composition:**
  - Row 1 (mobile): subject count (full-width line, `text-sm text-ink-3`).
  - Row 2 (mobile): `[Load sample] [Quick add]` then `[Add subject]` full-width.
  - Desktop: count (left, auto) + `[Load sample] [Quick add]` + `[Add subject]` (right, ml-auto).
- **Button hierarchy:**
  - Add Subject: primary (`bg-accent`, `text-accent-ink`, filled).
  - Quick Add: secondary (`border-line-strong`, `bg-surface`, `text-ink-2`).
  - Load Sample: secondary (same as Quick Add).
- **Dimensions:** all 44px min height; horizontal padding 16px; gap 8px.
- **Wrapping:** `flex flex-wrap`; primary `w-full sm:w-auto sm:ml-auto`. No unpredictable wrapping of related actions (secondaries grouped before primary).
- **320px:** count on its own line; secondaries side-by-side; primary full-width below.

### Subject list
- **Purpose:** Display subjects; main visual anchor.
- **Position:** Below toolbar.
- **Width:** Full content width.
- **Spacing:** 8px between cards (`space-y-2`).
- **Card treatment:** `border border-line bg-surface rounded-lg p-4`. No shadow. First row: identity group (color dot + name, `min-w-0`, `flex-1`) and action group (Edit, Delete, `shrink-0`, `gap-2`), `flex flex-wrap items-center justify-between gap-2`. Actions align right when space allows and wrap below the identity group when the name needs room. Meetings list and notes below.
- **Meeting info:** `{days} · {start}–{end}` · room · instructor (joined with ` · `). Wrap safely (`break-words`).
- **Hover/focus:** Card `hover:bg-surface-raised` (subtle); buttons have focus ring.
- **Long subject names:** The name container uses `min-w-0` and `break-words`; the action button group uses `shrink-0` on the same row. If the name is long enough to leave no room for actions at 320px, the header row wraps (`flex-wrap`) and actions move to a new line below the name, right-aligned. Meeting info and notes wrap independently. No horizontal overflow; no truncation of names.
- **Empty state (first-use):** Centered within list area (not full screen): title `text-lg font-semibold`, description `text-sm text-ink-2`, primary action button. `p-8`, `border border-dashed border-line-strong`, `rounded-lg`, `bg-surface`.
- **Storage-error state:** Distinct: warning icon (optional) + "Couldn't save your schedule" + explanation. No retry button and no reload recommendation: the existing architecture has no meaningful retry (IndexedDB init/persistence failure transitions to in-memory mode; reloading would discard unsaved in-memory changes). Behavior: keep working in memory; changes are held in React state and may not persist. Surface the warning banner (§H.2) and let the user continue editing or export a wallpaper. Communicate the limitation clearly. Use `bg-warn/10`, `border-warn/40`, `text-warn`.

### Footer
- **Purpose:** Save status (Saving… / Saved locally / Memory only).
- **Position:** Bottom of content.
- **Typography:** `text-xs text-ink-3`.
- **Behavior:** `aria-live="polite"`. No change on theme.

### Content width
- **Initial target:** 672px (`--content-default` / `max-w-2xl`), centered with horizontal padding.
- **Evaluate at 768/1024/1440:** If subject cards or settings controls feel cramped or awkwardly narrow, expand to 768px (`max-w-3xl`). Do not force 672 if it harms usability. Document final decision after visual review (NOT TESTED).

---

## G. Subject List and Toolbar Specification

(See §F toolbar and subject list above.)

**Subject card internal hierarchy:**
1. Identity group (left, `min-w-0`, `flex-1`): color dot (16px, `rounded-full`, `border-line`, `aria-hidden`) + subject name (`font-semibold text-ink`, `break-words`).
2. Action group (right, `shrink-0`, `gap-2`): Edit (bordered button) + Delete (danger text link). Aligned to the right when space allows; wraps below the identity group when the name needs more room. No truncation of the subject name.
3. Meetings list (`mt-3`, `space-y-1`, `text-sm text-ink-2`).
4. Notes (`mt-2`, `text-sm text-ink-3`).

**Color indicator accessibility:** The color dot is decorative — the subject name is the identifier, and color is a visual aid only. Retain `aria-hidden="true"` on the dot. Do not add an `aria-label` to a decorative element. If a future feature makes color semantically meaningful (e.g., color-coded categories), revisit.

---

## H. Empty, Loading, Error, and Feedback State Specification

### 1. First-use empty state
- **Visual:** Centered card in list area. Title `text-lg font-semibold text-ink`. Description `text-sm text-ink-2` (max 2 lines). Primary action button below.
- **Message:** "No subjects yet" / "Add your first subject and meeting to start building your wallpaper. Schedules are stored locally on this device."
- **ARIA:** No live region (static). Heading level `h3` (empty-state title; `h2` is the "Subjects" section heading).

### 2. Storage-error state
- **Visual:** `bg-warn/10`, `border-warn/40`, `text-warn`. Icon optional (⚠). Title + explanation. No retry button, no reload button.
- **Message:** "Storage unavailable" / "Your schedule is kept in memory but may not persist across reloads. You can continue editing. Exporting a wallpaper saves a visual copy of your timetable, but it does not back up or restore your editable schedule data, and new edits may be lost after a reload." (No reload recommendation - reloading would discard unsaved in-memory changes.)
- **Actual behavior (from `useSchedule`):** On init failure, `storageMode` becomes `memory`, `storageWarning` is set, autosave is disabled, and the in-memory schedule is retained. On save failure (`SAVE_FAILED`/`IDB_UNAVAILABLE`/`GET_DEFAULT_FAILED`), the hook transitions to memory mode, leaves `dirty` true, and stops further IndexedDB writes. Persisted data (if any) remains in IndexedDB; only new changes are memory-only.
- **Limitation:** There is no retry or recovery mechanism. If IndexedDB becomes available again, the app does not re-attempt persistence. Reinitializing storage requires reloading the page, which discards unsaved in-memory changes; the architecture provides no in-app recovery. This limitation must be communicated, not hidden. Do not instruct the user to reload while unsaved changes may be lost.
- **ARIA:** `role="alert"` (assertive) since it's an error.

### 3. Loading state
- **Visual:** Centered "Loading Esked…" text. No skeleton: the initial load awaits `scheduleRepository.getDefaultSchedule()` (an IndexedDB read), and a skeleton could present a misleading interim empty state if the read is slow or fails. The loading indicator is shown only while `loading` is true.
- **ARIA:** `aria-busy="true"` on main.

### 4. Form-validation state
- **Visual:** Inline `role="alert"` text below form/field, `text-danger`, `text-sm`. Inputs get `aria-invalid="true"` and `aria-describedby` pointing to error.
- **Message:** Specific (e.g., "Subject name is required").

### 5. Save status
- **Visual:** Footer text: "Saving…" / "Saved locally" / "Memory only" (current). `aria-live="polite"`.
- **On failure:** Transition to storage-error state (§H.2).

### 6. Export status
- **Visual:** Inline text below preview: "Generating…" / "Downloaded" / "Shared" / error. `aria-live="polite"` (polite, not assertive, since not blocking).
- **On failure:** `role="alert"` error text with `text-danger`.

### 7. Delete confirmation dialog
- **Title:** "Delete subject?"
- **Message:** "“{name}” and its {n} meeting(s) will be removed. This cannot be undone." (or "No meetings." if zero).
- **Cancel button:** "Keep subject" (secondary, focused by default — safe option gets focus).
- **Destructive button:** "Delete subject" (danger styling: `bg-danger`, `text-white`).
- **Keyboard:** Esc cancels; Enter on focused button activates; Tab cycles; focus trapped; focus restored to trigger on close.
- **ARIA:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`, `aria-describedby` for message.
- **No undo state management** (owner decision). Confirmation dialog is the recovery mechanism.

---

## I. Customize Screen Specification

### Layout
- **Section:** Single column, max content width (672px test).
- **Grouping:** Group controls into labeled subsections:
  - **Template:** Template select.
  - **Appearance:** Wallpaper theme select.
  - **Size:** Preset select + custom dimensions (collapsible, shown when custom).
  - **Display:** Checkboxes (Show room, Show time, Show safe zones).
- **Subsection headings:** `text-sm font-semibold text-ink`, `mt-4 mb-2`.
- **Controls:** 2-col grid at ≥640px for paired (template/theme), single column below. Inputs 40px height, radius 6.
- **No live preview** (deferred). User switches to Preview tab.

---

## J. Preview Screen Specification

### Layout
- **Preview canvas:** Centered, scales to container (max 480px mobile, up to 640px at ≥1024). Aspect ratio preserved via `aspect` from preset.
- **Controls row:** Zoom (- / % / + / Reset) + Safe zones checkbox, centered, `flex-wrap`.
- **Export row:** Download PNG (primary, full-width on mobile, auto on desktop) + Share (secondary, if supported).
- **Warnings:** Amber banner above/below preview.
- **Status/error:** Centered text below export row.
- **Output info:** "Output: W × H px" muted text at bottom.
- **No side-by-side with settings** (deferred).

---

## K. Subject and Quick Add Dialog Specifications

### Subject dialog (see §H.7 for delete; form per existing SubjectForm)
- **Header:** "Add subject" / "Edit subject" + close button.
- **Fields:** Name (required), Color (8 swatches), Notes, Meetings section.
- **Meetings:** Each in a bordered card (`border-line`, `rounded-md`, `p-3`), `space-y-3`. Day checkboxes (44px min, `gap-1`), Start/End (paired, collapse on mobile), Room/Instructor (paired), Notes, Remove meeting (danger text link).
- **Footer:** Cancel (secondary) + Save (primary), right-aligned, `gap-2`.
- **320px:** All fields single column; day checkboxes wrap; paired fields collapse.
- **Validation:** Inline `role="alert"` below form; inputs get `aria-invalid` + `aria-describedby`.

### Quick Add dialog
- **Header:** "Quick add subject" + close.
- **Body:** Textarea (3 rows) + Parse + Use manual form. Format help + examples below textarea.
- **Errors/warnings:** Banners above review section.
- **Review section:** Shown after successful parse, bordered card. Fields: Name, Days, Start/End, Room. Cancel + Add subject footer.
- **Preserve:** parser behavior and review-before-save flow. No new parsing features.

---

## L. Final Design System

### Colors
Semantic tokens (defined in `src/index.css`, Phase A). No new brand colors. Status colors retained. Wallpaper export theme is independent of these application tokens.

| Token | Light | Dark | Use |
|---|---|---|---|
| canvas | #f8fafc | #020617 | Page background |
| surface | #ffffff | #0f172a | Cards, panels, inputs |
| surface-raised | #ffffff | #1e293b | Hover, nested surfaces |
| ink | #0f172a | #f1f5f9 | Primary text |
| ink-2 | #475569 | #cbd5e1 | Secondary text/labels |
| ink-3 | #64748b | #94a3b8 | Muted/meta text |
| line | #e2e8f0 | #1e293b | Hairline borders |
| line-strong | #cbd5e1 | #334155 | Input borders |
| accent | #0f172a | #f1f5f9 | Primary buttons, active nav, focus |
| accent-ink | #ffffff | #0f172a | Text on accent |
| focus | #64748b | #94a3b8 | Focus rings |
| warn | #b45309 | #fbbf24 | Warnings |
| danger | #b91c1c | #f87171 | Errors/destructive |
| success | #15803d | #4ade80 | Success |

### Typography
- **Font stack:** `system-ui, 'Segoe UI', sans-serif` (Roboto removed). Mono: `ui-monospace, 'SF Mono', Menlo, Consolas`.
- **Scale:** major third 1.25: xs 12, sm 14, base 16, lg 20, xl 25, 2xl 31.
- **Weights:** 400, 500, 600.
- **Line heights:** tight 1.2 (headings), normal 1.5 (body), relaxed 1.6 (long text).
- **Letter spacing:** -0.01em on xl+; 0 on body.
- **Tabular nums:** for times and numeric values (`font-variant-numeric: tabular-nums`).

### Spacing
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96 px.
- Gutters: 16 (mobile), 24 (tablet), 32 (desktop).
- Section spacing: 24 within groups, 40–48 between major sections.
- Component padding: 16 (cards), 12–16 (inputs/buttons).

### Shapes
- Buttons: radius 6, height 44/40/36.
- Inputs: radius 6, height 40.
- Cards/panels: radius 8.
- Dialogs: radius 8.
- Segmented nav: radius 6.
- Status indicators: radius 4 (or pill for badges).
- Subject color swatch: `rounded-full`.

### Interaction states
- **Default:** resting appearance.
- **Hover:** `bg-surface-raised` for secondary; opacity 0.9 for primary.
- **Focus-visible:** 2px `--focus` ring, 2px offset. Never removed.
- **Active:** slight scale (0.98) or darker fill, 120ms.
- **Selected:** filled accent or checkmark.
- **Disabled:** 50% opacity, `cursor: not-allowed`, no hover.
- **Loading:** inline spinner or "Generating…" text; button disabled.
- **Error:** `border-danger`, `text-danger`, `role="alert"`.

### Motion
- Durations: 120ms (micro), 200ms (standard), 320ms (overlay).
- Easings: ease-out (entrances), ease-in (exits).
- Only transform/opacity/filter animated.
- `prefers-reduced-motion`: zero durations.

---

## M. HCI and Accessibility Requirements

### Navigation semantics decision
**Actual implementation (verified in `src/App.jsx`):** tabs are `useState('schedule')` in `App.jsx`; clicking a tab swaps the entire `<section>` content inside `<main>`; there is no router and no `role="tabpanel"`. The controls are `<button>` elements inside `<nav aria-label="Primary">` with `aria-current={tab === t.id ? 'page' : undefined}`.

This is **navigation between views**, not a tab interface. Although visually tab-like, each control replaces the whole main content, which is view navigation, not in-page tabpanels. Recommendation: keep `<nav>` + `<button>` + `aria-current="page"` (current implementation). Do not add `role="tablist"`/`role="tab"`/`role="tabpanel"` or arrow-key handling — those are for composite widgets (tabs, menus, listboxes) and would misrepresent the interaction. Keyboard behavior: Tab/Shift+Tab moves between buttons; Enter/Space activates; focus stays on the activated button. No arrow-key navigation needed. **Rationale:** ARIA tab pattern implies content is a tabpanel controlled by tabs; here each "tab" replaces the entire main content. Using tablist roles would mislead assistive technology into expecting tabpanel semantics.

### Skip link
- Visually hidden link at top of page: "Skip to main content" → `#main`. Visible on focus. `z-index: 9999`.

### Headings
- `h1`: "Esked" (page title).
- `h2`: section headings ("Subjects", "Customize", "Preview").
- `h3`: subject names, empty-state titles, modal titles.
- No skipped levels.

### Main/navigation landmarks
- `<header>`, `<nav aria-label="Primary">`, `<main id="main" tabindex="-1">`, `<footer>`.

### Dialog focus management
- On open: move focus to first focusable element (or title). On close: restore to trigger.
- Trap focus (existing Modal implementation). Esc closes.
- `aria-modal="true"`, `aria-labelledby`.

### Form labels and errors
- Every input has `<label for>`.
- Errors linked via `aria-describedby`; `aria-invalid="true"` on invalid fields.
- Required fields marked with `required` attribute + visual asterisk.

### Live regions
- Footer status: `aria-live="polite"`.
- Storage/error/form-error banners: `role="alert"` (assertive) for errors; `aria-live="polite"` for warnings.
- Export status: `aria-live="polite"`.
- Live regions must pre-exist in DOM (not injected with content).

### Destructive actions
- Delete subject: confirmation dialog (§H.7). Focus on safe option ("Keep subject").
- No undo state management.

### Subject color indicators
- The color dot is decorative (color is visual identification; the name is the identifier). Retain `aria-hidden="true"`. Do not add an `aria-label` to a decorative element. Revisit only if color becomes semantically meaningful.

### Canvas preview
- `role="img"` + `aria-label="Wallpaper preview"`.

### Reduced motion
- Existing block in `src/index.css` — keep.

### Contrast
- Target: body text 4.5:1, large text 3:1, UI boundaries 3:1 in both themes (WCAG 2.2 AA).
- Three separate verification categories (do not conflate):
  1. **Theme application (verified via CDP):** `.dark` class, semantic token values, and computed body background/text colors were confirmed at all tested widths for both themes.
  2. **Contrast measurement (NOT performed):** Actual foreground/background contrast ratios were not calculated. Phase G must measure relevant text, controls, borders, focus indicators, and status colors in both themes.
  3. **Visual inspection (NOT performed):** Screenshots were captured but not visually reviewed for composition, hierarchy, readability, or appearance (this agent cannot view images).
- Contrast verification belongs to Phase G and requires actual measurements, not theme-application checks.

### Touch targets
- 44×44px minimum (WCAG floor 24px). Already met.

### Nielsen heuristics mapping
Key requirements (from the comprehensive audit, HCI section): visibility of status (footer + live regions), user control (cancel on modals, confirmation on delete), error prevention (validation before save), recognition (visible labels), cognitive load (grouped decisions), consistency (tokens). The full heuristic-by-heuristic evaluation is in the comprehensive audit delivered in the prior session; it is not stored as a repository file.

### Fitts's Law
- Primary action in predictable location (right-aligned toolbar, full-width on mobile for thumb reach).
- 44px targets with 8px spacing.
- Destructive actions separated from primary.

### Hick's Law
- Action toolbar: 3 actions (Load sample, Quick add, Add subject) + count. Acceptable. Settings grouped into subsections to reduce simultaneous choices.

---

## N. Responsive Layout Specifications

### Breakpoints (deliberate, not Tailwind defaults blindly)
- **<640 (mobile):** single column; two-level header; primary action full-width.
- **640–767 (large mobile/small tablet):** identity inputs two-column; paired form fields two-column; settings two-column.
- **768–1023 (tablet):** single-row header; settings/preview could be side-by-side (deferred).
- **≥1024 (desktop):** max-width 672 (test) or 768; centered.

### Per-width specification

**320px (small mobile):**
- Header: two levels (brand+toggle 48px, segmented nav 44px).
- Gutters: 16px.
- Identity: single column, inputs full-width.
- Toolbar: count line + secondaries row + primary full-width.
- Subject cards: full width, actions shrink-0.
- Dialogs: full-width minus 16px gutters, max-h 90vh, scroll.
- Preview: scales to container (~288px), export buttons full-width.

**390px (standard mobile):**
- Same structure as 320px. Subject count on its own line; Load Sample and Quick Add grouped; Add Subject remains full-width below them.

**430px (large mobile):**
- Same structure; secondary actions may sit on one line with each other, but the count remains on its own line and Add Subject remains full-width below them.

**768px (tablet):**
- Header: single row.
- Identity: two-column.
- Toolbar: single row (count left, actions right).
- Subject cards: full width (no grid — readability).
- Settings: two-column grid.
- Preview: up to 480px.

**1024px (small desktop):**
- Content width: test 672px, expand to 768 if awkward.
- Same layout as tablet but with more whitespace.

**1440px (desktop):**
- Content centered in max-width. No side-by-side (deferred). Generous margins.

### Content width decision
- **Initial target:** 672px (`max-w-2xl`).
- **Evaluate at 768/1024/1440:** If subject cards or settings feel cramped or awkwardly narrow, expand to 768px (`max-w-3xl`). Document final decision after visual review (NOT TESTED).

---

## O. Desktop and Mobile Wireframes

(Desktop and mobile wireframes are defined in §O below; the comprehensive audit contained earlier drafts which this specification supersedes.)

### Desktop Schedule (1024px, Concept 1)
```
┌──────────────────────────────────────────────────────────────┐
│ [Esked]        [Schedule][Customize][Preview]            [☀] │  (56px header)
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Schedule title  [____________]   Semester  [____________]    │  identity (quiet)
│                                                              │
│  3 subjects                          [Load sample][Quick add][Add subject] │  toolbar
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ● Math 201                                    [Edit][Delete] │
│  │   Mon, Wed, Fri · 08:00–09:30 · R204                   │
│  │ ● Physics 101                                 [Edit][Delete] │
│  │   Tue, Thu · 10:00–11:30 · Lab 2                       │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Saved locally                                               │
└──────────────────────────────────────────────────────────────┘
```

*The desktop wireframe shows the preferred same-row arrangement of the identity and action groups when sufficient space is available. At narrower widths, the action group wraps below the identity group; subject names are never truncated.*

### Mobile Schedule (320px)
```
┌──────────────────────────┐
│ [Esked]            [☀]   │  level 1
│ [Schedule][Customize][Preview] │  level 2 (full-width)
├──────────────────────────┤
│ Schedule title            │
│ [______________________] │
│ Semester                  │
│ [______________________] │
│                          │
│ 3 subjects               │
│ [Load sample][Quick add] │
│ [     Add subject      ] │
│                          │
│ ┌──────────────────────┐ │
│ │ ● Math 201  [Edit][Del]│
│ │   Mon,Wed,Fri 08:00– │
│ │   09:30 · R204       │
│ └──────────────────────┘ │
│                          │
│ Saved locally            │
└──────────────────────────┘
```

### Subject modal (320px)
See §K Subject dialog.

### Quick Add modal (320px)
See §K Quick Add dialog.

### Customize + Preview (tablet, 768px)
See §J (side-by-side deferred; currently separate tabs). On tablet, tabs remain; each view uses full content width.

---

## P. Visual Composition Rationale

- **Visual hierarchy:** Subject list is the anchor (largest visual weight via card rhythm). Identity inputs are quiet (no large heading, `text-lg` input only). Toolbar is compact and adjacent to list (proximity). Primary button is filled (contrast). Footer is muted (ink-3, xs).
- **Balance:** Header is compact (56px desktop, 100px mobile). Content centered with generous side margins on desktop. No single section dominates.
- **Alignment:** All content left-aligned within centered container. Inputs and buttons share radius (6) and height (40/44). Labels above inputs.
- **Proximity:** Toolbar directly above list (8px gap) signals relationship. Meeting fields grouped in bordered card. Subject identity (color dot + name) and action group (Edit/Delete) are separate groups; actions align right when space allows and wrap below the identity group when the name needs more room. Long names are never truncated.
- **Repetition:** Consistent card pattern, consistent button styling, consistent spacing scale. Empty state reuses card language (border + surface).
- **Contrast:** Primary button filled accent; secondary bordered; danger tinted. Text levels ink/ink-2/ink-3. Theme application (class + computed colors) verified via CDP; contrast measurement and visual inspection NOT performed.
- **White space:** 24px between major sections, 8px within groups. Generous empty-state padding for first-use emphasis.
- **Scale/proportion:** Content capped at 672 (test) to keep line length readable (~60–75ch). Cards use full width within container.
- **Typography:** Major-third scale; weights 400/500/600; negative tracking on headings. Platform default stack (no Roboto).
- **Visual rhythm:** Consistent 4px-based spacing; card `space-y-2`; meeting `space-y-1`.
- **Unity:** Single token system, single radius scale, single accent, consistent focus ring. PWA banners use same border/surface language.

---

## Q. Revised Implementation Roadmap

### Phase D — Accessibility foundation
- **Objective:** Establish shared accessibility infrastructure and fix confirmed gaps.
- **Scope:** Skip link; heading relevel (h1→h2→h3); form error association (`aria-describedby`/`aria-invalid` on inputs); live-region infrastructure (footer status, banner containers, export status region) so they pre-exist in the DOM; accessible delete confirmation dialog replacing `window.confirm` (§H.7) including focus trap, focus restore, Esc, and `aria-describedby`; canvas `role="img"` + `aria-label`; subject color indicator semantics (decorative, `aria-hidden` retained).
- **Excluded:** Layout changes, new features, undo, export-specific feedback copy, empty-state redesign.
- **Files:** `src/index.css`, `src/App.jsx`, `src/components/Modal.jsx`, `SubjectForm.jsx`, `ScheduleView.jsx`, `PreviewCanvas.jsx`.
- **Dependencies:** Phase B/C done.
- **Risks:** Modal tests may need selector updates; tab keyboard behavior unchanged (still Tab/Enter); dialog focus restore must be verified.
- **Tests:** Extend existing `src/components/a11y.test.jsx` (do not assume axe is installed — it is not in `package.json`; add axe only if justified and approved). Keyboard walk; screen reader spot check.
- **Manual verification:** Keyboard-only navigation; screen reader 5-min pass; verify live regions announce.
- **Acceptance:** No `window.confirm`; skip link present; headings sequential; form errors field-linked; live regions pre-exist and announce; dialog focus managed; axe zero violations or justified (if added).

### Phase E — HCI and interaction states
- **Objective:** Complete state coverage and feedback (uses Phase D infrastructure).
- **Scope:** Distinct first-use and storage-error states (safe messaging, no unsafe reload, no retry beyond architecture support); export progress, success, and failure feedback using the Phase D live-region infrastructure; remaining interaction-state improvements; end-to-end interaction verification across all 10 journeys.
- **Excluded:** Layout recomposition, new features, re-implementing the delete dialog (Phase D owns it; Phase E may test/refine the user journey only), undo state management.
- **Files:** `ScheduleView.jsx`, `App.jsx`, `PreviewCanvas.jsx`, `Modal.jsx` (dialog refinements only, no re-implementation).
- **Dependencies:** Phase D.
- **Risks:** Storage-error messaging must not promise retry/recovery that the architecture doesn't support; must not recommend reload while unsaved in-memory changes may be lost.
- **Tests:** Flow tests for delete confirmation journey, storage-error state, export status feedback.
- **Manual verification:** Walk all 10 journeys; verify no data loss on storage failure.
- **Acceptance:** Empty states distinct; storage error communicated safely; export status announced; delete journey verified; no unsafe reload recommended.

### Phase F — Layout and visual recomposition (Concept 1)
- **Objective:** Recompose Schedule screen per Concept 1.
- **Scope:** Compact header (two-level mobile, single-row desktop), identity row quiet, toolbar above list, content width test 672, subject card lightening, EmptyState centering.
- **Excluded:** New features, side-by-side preview, undo.
- **Files:** `App.jsx`, `ScheduleView.jsx`, `SubjectCard.jsx`.
- **Dependencies:** Phase E.
- **Risks:** Visual regression; test selectors.
- **Tests:** Existing + overflow check at all widths.
- **Manual verification:** Visual review at 320/390/768/1024/1440 in both themes.
- **Acceptance:** No overflow; header height reduced; primary action visually dominant.

### Phase G — Visual polish and final verification
- **Objective:** Polish and verify.
- **Scope:** Drop Roboto, apply `--text-*` scale, close-button icon, contrast verification, content-width final decision, full visual review.
- **Excluded:** New features.
- **Files:** `src/index.css`, multiple components.
- **Dependencies:** Phase F.
- **Risks:** Font change affects layout; contrast fixes may change tokens.
- **Tests:** Full suite + lint + build.
- **Manual verification:** Contrast checker (4.5:1 body, 3:1 large/UI); visual review all widths both themes.
- **Acceptance:** All tests pass; contrast verified; visual review documented; AGENTS.md updated.

---

## R. Final Owner Approval Checklist

### Approved design decisions
- Concept 1 — Focused Single-Column.
- Compact two-level mobile header.
- 672px initial content-width hypothesis.
- Accessible delete confirmation dialog; no undo.
- Distinct first-use and storage-error states.
- Skip link and corrected heading hierarchy.
- Navigation semantics using `<nav>` and buttons with `aria-current`.
- Field-associated form errors and relevant live regions.
- Remove Roboto from the proposed font stack.
- No new features.

### Still pending
- Visual verification and final content-width decision.
- Contrast measurements in both themes.
- Native form-control appearance verification.
- Other verification explicitly assigned to later phases.

### Implementation authorization
- The design direction is approved.
- Phase D implementation is NOT YET AUTHORIZED.
- Phase D requires a separate explicit owner approval.

---

## Remaining assumptions and unresolved questions

1. **Content width final value** (672 vs 768) requires visual review — NOT TESTED.
2. **Contrast in dark mode** not visually verified — requires checker in Phase G.
3. **Native form control appearance** in dark mode — deferred to Phase D/E.
4. **Subject color swatch** - decorative; `aria-hidden="true"` retained; no `aria-label`.
5. **Live preview in settings** — deferred per owner decision; may revisit.
6. **Undo vs. confirm for delete** — owner chose confirm dialog; no undo state management.

---

## Final Report Requirements

1. **Repository branch and initial Git status:** Branch `main`; Phase A/B/C work is committed in `98eee2a`; this specification document is the only untracked file before this correction.
2. **Files inspected:** AGENTS.md, package.json, vite.config.js, index.html, src/index.css, src/main.jsx, src/App.jsx, all components, hooks, tests, docs/architecture.md, plus CDP verification artifacts.
3. **Standalone specification document created:** Yes — `docs/ui-ux-design-specification.md`.
4. **Exact document path:** `C:\Users\john marc comeros\OneDrive\Desktop\Esked\docs\ui-ux-design-specification.md`
5. **Summary of final layout decisions:** Concept 1 Focused Single-Column; subject list as anchor; quiet identity row; grouped toolbar above list with primary right-aligned/full-width on mobile; two-level mobile header; 672px content width (test); separate empty states; confirmation dialog for delete; nav stays `<nav>`+buttons with `aria-current`.
6. **Summary of responsive behavior:** Mobile-first; single column below 640; two-level header below 768; identity/paired fields two-column at ≥640; no horizontal overflow (verified); safe-area padding on modals.
7. **Summary of HCI and accessibility decisions:** Skip link, heading relevel, form error association, live regions, confirmation dialog (no undo), canvas role, decorative subject color indicator (`aria-hidden="true"`, no `aria-label`), reduced motion, 44px targets, contrast verification deferred.
8. **Revised implementation roadmap:** Phase D (accessibility) → E (HCI/states) → F (layout recomposition) → G (polish/verification). Each with scope, exclusions, files, dependencies, risks, tests, manual verification, acceptance criteria.
9. **Remaining assumptions and unresolved questions:** Listed above (content width, contrast, native controls, color swatch SR, live preview deferred, delete mechanism).
10. **Confirmation that no application source files, styles, tests, configuration, or dependencies were modified:** Confirmed. Only `docs/ui-ux-design-specification.md` was created (new file, no existing file overwritten).
11. **Confirmation that no commits or pushes were made:** Confirmed.
12. **Confirmation that existing Phase A/B/C work was preserved:** Confirmed - all prior changes are committed in `98eee2a` and untouched by this documentation correction.

**STOP. Implementation has not started. Awaiting owner's explicit review and approval of this specification before Phase D.**

---

## Revision History

- **Revision date:** 2026-11-19 (targeted revision).
- **Issues addressed:**
  1. Safe storage-error recovery — removed unsafe "reload to retry" recommendation; documented actual in-memory fallback behavior and limitation.
  2. Removed Phase D/E responsibility overlap — delete dialog and live-region infrastructure owned by Phase D; export feedback and empty states owned by Phase E.
  3. Resolved header breakpoint/dimension contradictions — defined exact row heights, total mobile header height (100px), and behavior at 640/768/1024.
  4. Made touch-target requirements consistent — 44×44 default; clarified visible vs hit area; documented exceptions.
  5. Corrected theme/contrast verification claims — separated theme application (verified via CDP) from contrast measurement and visual inspection (not performed); Phase G requires actual measurements.
  6. Clarified navigation semantics — based on actual `src/App.jsx` behavior (view-switching buttons in `<nav>`, `aria-current="page"`); no ARIA tablist.
  7. Made specification self-contained — included color token table in §L; resolved references to comprehensive audit sections.
  8. Resolved minor ambiguities — subject color dot decorative (aria-hidden retained); PWA notice priority/coexistence rule; long-name wrapping behavior; IndexedDB loading behavior without claiming speed; accessibility test file references corrected (axe not installed).
- **Confirmation:** Approved design direction preserved (Concept 1, two-level header, 672px hypothesis, separate Customize/Preview, confirm dialog, no undo, no new features).
- **Confirmation:** Implementation has not started. No source files, styles, tests, configuration, or dependencies were modified.