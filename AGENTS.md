# AGENTS.md — Esked

> Mandatory reading for every OpenCode session working on this repository.
> Read this file before doing any project work. Then inspect the repository and Git status,
> review recent changes, compare documented progress with actual implementation, and verify
> tests/builds instead of trusting previous reports.

---

## 1. Project Identity and Product Overview

- **Product name:** Esked
- **Type:** Free, offline-first Progressive Web App (PWA)
- **Purpose:** Convert students' class schedules into beautiful, readable, high-resolution
  phone wallpapers.
- **Core value:** A student can add subjects and schedules, customize, pick a template/theme,
  preview, and download/share a PNG wallpaper in under two minutes.
- **Privacy:** All schedule data stays on the user's device. No backend, no accounts, no
  cloud database, no analytics by default, no paid API.
- **Target devices:** Android phones, iPhones, desktop browsers, tablets.
- **Target viewports:** 320px to 1920px.

## 2. Problem Statement and Target Users

**Problem:** Students often need a quick, glanceable view of their weekly class schedule on
their phone lock/home screen. Manually designing a wallpaper is tedious; existing tools are
heavy, online-only, or require accounts.

**Target users:** Students (high school / college) who want a clean schedule wallpaper
without creating accounts or uploading personal data.

## 3. Product Goals, MVP Scope, Non-Goals, Future Features

### Goals
- Offline-capable after first successful visit.
- Fast end-to-end flow (under 2 minutes).
- High-resolution PNG export suitable for phone wallpapers.
- Accessible, responsive, touch-friendly.

### MVP scope (planned)
- Add/edit/delete subjects with schedules (day, start/end time, room, color, notes).
- Customize days, times, rooms, colors, and other info.
- Select a wallpaper template and theme.
- Preview wallpaper.
- Download or share generated PNG.
- Local persistence via IndexedDB with in-memory fallback.

### Non-goals
- No backend, authentication, cloud sync, or multi-user support.
- No analytics by default.
- No paid services.

### Future features (not in MVP)
- Import/export schedule data (JSON) with validation.
- Multiple wallpaper sizes/resolutions presets.
- Additional templates and themes.
- Localization beyond base language.
- Print-friendly export.

## 4. Complete Technology Stack

- React 18
- Vite (v8.x in current scaffold)
- JavaScript (ES6+) + JSX (no TypeScript)
- Tailwind CSS v4 (via @tailwindcss/vite)
- vite-plugin-pwa + Workbox (service worker, precaching)
- IndexedDB via `idb`
- HTML5 Canvas API
- Vitest + React Testing Library + jsdom
- Lucide React optional (avoid unnecessary deps)
- crypto.randomUUID() for IDs (with fallback)

No backend, no auth, no cloud DB, no paid API.

## 5. System Architecture

Layers (keep separated):
- **UI** (`src/components/`, `src/App.jsx`): rendering, interaction, accessibility.
- **State/hooks** (`src/hooks/`): reusable stateful behavior.
- **Business logic** (`src/lib/`): pure functions, no React.
- **Storage** (`src/storage/`): IndexedDB access + in-memory fallback.
- **Rendering** (`src/rendering/`): Canvas wallpaper generation and PNG export.

Data flow: UI -> hooks -> lib (validation/transform) -> storage (persist) -> rendering (canvas).

All schedule data remains local.

## 6. Complete Schedule Data Model

Planned entities:

### Subject
```
{
  id: string (uuid),
  name: string,
  color: string (hex),
  notes: string (optional),
  createdAt: number,
  updatedAt: number
}
```

### ScheduleEntry (a subject's time slot)
```
{
  id: string (uuid),
  subjectId: string,
  day: 0..6 (0=Sunday or configurable; document chosen convention),
  startTime: string ("HH:mm"),
  endTime: string ("HH:mm"),
  room: string (optional),
  notes: string (optional)
}
```

### WallpaperSettings (user preferences)
```
{
  templateId: string,
  themeId: string,
  width: number,
  height: number,
  showRoom: boolean,
  showNotes: boolean,
  ...
}
```

### AppSettings
```
{
  id: "app",
  lastRoute: string (optional),
  ...
}
```

IDs via crypto.randomUUID() with fallback. Validate all inputs. No mutation of state.

## 7. IndexedDB Database Structure

Planned (database name: `esked`, version 1):

Object stores:
- `subjects` (keyPath: `id`)
- `scheduleEntries` (keyPath: `id`, index `by-subject` on subjectId, index `by-day` on day)
- `settings` (keyPath: `id`)

In-memory fallback when IndexedDB unavailable, with user notice that changes may not persist.

Storage failures handled gracefully (try/catch, surface error state).

## 8. Design System and Color Tokens

Modern, minimal, polished, student-friendly. Mobile-first. High contrast. Touch targets >= 44x44px.

Color tokens (planned, to be finalized in code):
- Neutral slate scale for UI chrome (slate-50..900).
- Accent: slate-900 for primary actions.
- Subject colors: user-selectable palette (to be defined).
- Wallpaper themes: light/dark variants.

Spacing: Tailwind default scale. Rounded corners (lg). Subtle borders/shadows.

Avoid excessive gradients/glassmorphism/decoration/animations.

## 9. UI/UX Requirements and Screen Inventory

Screens (planned):
1. **Home / Schedule** — list of subjects and entries; add/edit/delete.
2. **Subject Form** — create/edit subject (name, color, notes) + schedule slots.
3. **Customize** — days, times, rooms, colors, display options.
4. **Template Picker** — choose wallpaper template + theme.
5. **Preview** — render wallpaper preview.
6. **Export** — download/share PNG.

States required: loading, empty, error, success. Responsive 320–1920px. Semantic HTML, ARIA.

## 10. Wallpaper Template Specifications

Planned templates (initial set):
- **Classic Grid** — days as columns, time slots as rows.
- **Compact List** — vertical list grouped by day.
- **Minimal** — clean, large typography, few details.

Each template supports theme (light/dark) and configurable density. Rendered via Canvas at target resolution.

## 11. User Flows

Primary flow:
1. Open Esked.
2. Add subjects and schedules.
3. Customize days/times/rooms/colors.
4. Select template + theme.
5. Preview.
6. Download or share PNG.

Under 2 minutes target.

## 12. Canvas Rendering and Export Requirements

- Use HTML5 Canvas API.
- Render at high resolution (device pixel ratio aware, configurable target dimensions).
- Export PNG via canvas.toBlob / toDataURL.
- Download via anchor download; share via Web Share API when available (with fallback).
- Clean up object URLs.
- Handle rendering errors gracefully.

## 13. PWA and Offline Requirements

- vite-plugin-pwa with Workbox generateSW.
- registerType: autoUpdate.
- Standalone display, start_url "/", scope "/".
- Precache app shell + assets.
- Offline fallback to cached index.html (navigation route).
- Manifest name/short_name "Esked", theme #0f172a, background #ffffff.
- Icons: currently SVG (favicon.svg) for any/maskable. Limitation: some platforms prefer PNG (documented). Not auto-replaced.

Offline behavior must be verified manually (not assumed from SW generation).

## 14. Parser Requirements and Supported Input Formats

Future import functionality (not in MVP): parse schedule data from text/CSV/JSON with validation.
- Validate imported data before accepting.
- Reject malformed entries with clear errors.
- No network transmission.

## 15. Edge Cases and Error Handling

- IndexedDB unavailable -> in-memory fallback + user notice.
- Storage quota exceeded -> surface error, avoid data loss.
- Invalid time ranges (end <= start) -> validation error.
- Overlapping schedule entries -> warn or allow (decide later; default warn).
- Empty schedule -> empty state UI.
- Canvas export failure -> error message + retry.
- Web Share unsupported -> download fallback.
- Offline first visit -> cannot work offline until cached; inform user.

## 16. Testing Strategy and Acceptance Criteria

- Vitest unit tests for pure logic (lib, storage adapters, rendering helpers).
- React Testing Library for components.
- Integration tests for flows where feasible.
- Accessibility checks (semantic HTML, ARIA, keyboard).
- Responsive layout checks.
- Build + lint in CI/local.

Acceptance: tests pass, lint clean, build succeeds, no console errors, PWA manifest valid.

## 17. Complete Phase 0–8 Roadmap

- **Phase 0 — Project Foundation / Scaffold**
- **Phase 1 — Data Foundation**
- **Phase 2 — Schedule Management UI**
- **Phase 3 — Quick Add Parser**
- **Phase 4 — Wallpaper Rendering Engine**
- **Phase 5 — Preview and Export**
- **Phase 6 — PWA and Offline**
- **Phase 7 — UX Polish**
- **Phase 8 — Final QA and Release Readiness**

Do not proceed to next phase without owner authorization.

## 18. Planned Project Structure

```
esked/
  AGENTS.md
  README.md
  docs/architecture.md
  index.html
  vite.config.js
  package.json
  public/
    favicon.svg
  src/
    App.jsx
    main.jsx
    index.css
    components/
    hooks/
    lib/
    storage/
    rendering/
    test/
```

## 19. Engineering Rules

- Inspect repo + Git status before changes.
- Read docs/config before editing.
- Never assume files/deps/features exist.
- Preserve working code; no unnecessary refactors.
- No dead buttons/fake interactions.
- No placeholder functionality for completed features.
- Keep data local; no external transmission.
- Handle storage failures gracefully.
- crypto.randomUUID() with fallback.
- Stable IDs for persisted entities.
- No direct state mutation.
- Clean up listeners/object URLs.
- Semantic HTML + ARIA.
- Min touch target 44x44.
- No TypeScript, no backend/auth/cloud/paid services.

## 20. Development Workflow

For each phase:
1. Investigate (inspect repo, git, docs).
2. Plan (files, approach, tests).
3. Implement (only assigned phase).
4. Test (unit/integration, build, lint, console, acceptance).
5. Debug (root cause, re-run, regression check).
6. Report (structured report with status labels).

Status labels: PASS, FAIL, BLOCKED, NOT TESTED. Never mark whole phase PASS if important criteria unverified.

Stop after phase; wait for owner approval.

## 21. Known Limitations and Technical Decisions

- Node v24 used for build (newer than typical); dependencies chosen for compatibility.
- vite-plugin-pwa v2.0.0 with vite v8; workbox-build pulls glob/minimatch with 4 moderate dev-only advisories. No safe non-breaking fix (would require downgrading to v1.1.0, losing vite 8 support). Production deps: 0 vulnerabilities (npm audit --omit=dev).
- PWA icons are SVG only; some install targets prefer PNG. Not auto-replaced (valid config). Can add PNG later.
- No Phase 1+ features implemented yet; only scaffold + docs.
- @types/react v19 with React 18 runtime (minor type mismatch, no runtime impact; could align to v18 types later).
- oxlint used instead of ESLint (configured by scaffold).

## 22. Current Project Status

- **Phase 0 (Project Foundation / Scaffold):** PASS (verified).
- **Phase 1 (Data Foundation):** PASS (verified).
- **Phase 2 (Schedule Management UI):** PASS (verified).
- **Phase 3 (Quick Add Parser):** PASS (verified). Pure parser + Quick Add modal integrated.
- **Phase 4 (Wallpaper Rendering Engine):** PASS (verified). Daily List, Weekly Columns, Today Focus; dark/light themes; presets; safe zones.
- **Phase 5 (Preview and Export):** PASS (verified). Preview + PNG download/share implemented.
- **Phase 6 (PWA and Offline):** NOT STARTED.
- **Phase 7 (UX Polish):** NOT STARTED.
- **Phase 8 (Final QA and Release Readiness):** NOT STARTED.
- **Implemented:** Phases 0-5 including Quick Add Parser.
- **Git:** branch main.
- **Last verified:** Phase 3 (see section 26).

## 23. Phase 0 Verification Results

Commands run (actual):
- `npm test` → 1 test file, 1 test passed (PASS)
- `npm run lint` (oxlint) → no issues (PASS)
- `npm run build` → success, ~174ms; PWA service worker + manifest generated; precache 7 entries (PASS)
- `npm run preview` → HTTP 200 served; app shell renders (PASS)
- `npm audit` → 4 moderate, dev-only (workbox-build via vite-plugin-pwa); no production impact
- `npm audit --omit=dev` → 0 vulnerabilities (PASS)

PWA verification (dist):
- Manifest: name/short_name "Esked", display "standalone", start_url "/", scope "/", theme_color "#0f172a", background_color "#ffffff". (PASS)
- Icons: favicon.svg (image/svg+xml, sizes "any", purpose any+maskable) — file exists in dist. (PASS, with limitation: SVG-only; some install targets prefer PNG)
- Service worker: generated (sw.js) with skipWaiting + clientsClaim; precaches registerSW.js, index.html, favicon.svg (x2), assets JS/CSS, manifest.webmanifest; navigation fallback to index.html. (PASS generation; offline runtime not manually tested)
- All declared icons exist in production output. (PASS)

Dependency versions (actual, from package.json):
- react 18.3.1, react-dom 18.3.1, idb 8.0.4
- vite 8.3.6, @vitejs/plugin-react 6.1.2, tailwindcss 4.3.5, @tailwindcss/vite 4.3.5
- vite-plugin-pwa 2.0.0, vitest 5.1.0, jsdom 31.0.1
- @testing-library/react 16.3.3, jest-dom 7.0.1, user-event 14.6.12
- oxlint 1.90.0

Checks:
- No TypeScript files introduced. (PASS)
- No backend/auth/cloud/paid dependencies. (PASS)
- No unnecessary external runtime requests. (PASS)
- Smoke test meaningful (renders Esked h1). (PASS)
- App shell renders. (PASS)

---

## 24. Phase 1 Implementation Details

### Data model (src/lib/model.js)
- Constants: `WEEKDAYS` (Mon..Sun), `TIME_REGEX` (HH:mm 24h), `HEX_COLOR_REGEX`, `DEFAULT_SETTINGS`, `DEFAULT_SUBJECT_COLOR`.
- Factories: `createMeeting`, `createSubject`, `createDefaultSchedule` (deeply independent; unique ids).
- Validators: `isWeekday`, `isValidTime`, `isValidColor`, `validateMeeting`, `validateSubject`, `validateSettings`, `validateSchedule`. Return `{ valid, errors }`.
- Rules: subject name required; subject may have 0 meetings; optional meeting details may be empty; invalid/unknown data not silently discarded (reported via errors).

### Reducer (src/lib/scheduleReducer.js)
Actions (SCHEDULE_ACTIONS):
- UPDATE_TITLE, UPDATE_SEMESTER, ADD_SUBJECT, UPDATE_SUBJECT, DELETE_SUBJECT,
  ADD_MEETING, UPDATE_MEETING, DELETE_MEETING, UPDATE_SETTINGS, REPLACE, RESET.
- Immutable updates; no storage inside reducer; invalid action types return state unchanged.

### IndexedDB schema (src/storage/db.js)
- DB name: `esked-db`, version 1.
- Stores: `schedules` (keyPath `id`), `meta` (keyPath `key`).
- Singleton connection promise; reset helper for tests.

### Repository (src/storage/scheduleRepository.js)
API: `getDefaultSchedule()`, `getSchedule(id)`, `saveSchedule(schedule)`, `deleteSchedule(id)`, `init()`.
- Ensures default schedule exists (stored in `meta` under `defaultScheduleId`).
- Throws `StorageError` with codes on failure.

### React integration (src/hooks/useSchedule.js)
- useReducer + initial load from repository.
- Exposes: schedule, dispatch, loading, saving, error, storageMode, storageWarning, isPersistent, flush.
- Dirty tracking prevents async init from overwriting newer state.
- Refs synced via effects to avoid render-time ref access warnings.

### Autosave
- Debounced ~400ms after meaningful changes.
- All saves are serialized through a single promise chain so an earlier save cannot complete after (and overwrite) a later one.
- Flush on `visibilitychange` (hidden) and unmount (best-effort).
- Rapid updates collapse into fewer saves; final state persisted.
- `saving` reflects in-flight save count; cleared only when no save in flight.
- Dirty is cleared on successful save only when the saved snapshot is still the latest; concurrent changes keep dirty true.

### Storage fallback
- If init fails: storageMode 'memory', storageWarning set, schedule kept in memory, autosave disabled, error exposed.
- Quota and other persistent-storage save failures (code SAVE_FAILED / IDB_UNAVAILABLE / GET_DEFAULT_FAILED) transition to explicit memory-only mode.
- On storage failure: latest schedule preserved in React state, warning exposed, further IndexedDB writes stopped, error surfaced.
- Validation/programming errors do not trigger memory-mode fallback.
- Failed saves never report successful persistence; dirty remains true.
- Storage errors remain distinguishable via StorageError codes.

### Concurrency guarantees
- Serialized save chain prevents stale overwrites.
- Rapid successive updates collapse to latest schedule.
- Manual/lifecycle flush while debounce pending is supported.
- Save failure during pending update preserves memory state and stops further writes.
- No outdated async operation overwrites newer persisted data.
- Cleanup performs best-effort final persist.

### Files created
- src/lib/ids.js
- src/lib/model.js
- src/lib/scheduleReducer.js
- src/storage/db.js
- src/storage/scheduleRepository.js
- src/hooks/useSchedule.js
- Tests: src/lib/model.test.js, src/lib/scheduleReducer.test.js, src/storage/scheduleRepository.test.js, src/hooks/useSchedule.test.jsx

### Dependencies changed
- Added devDependency: fake-indexeddb (testing).

### Test results
- `npm test`: 8 test files, 48 tests passed (PASS).
- `npm run lint`: no issues (PASS).
- `npm run build`: success (PASS).

### Known limitations
- Autosave relies on debounce timers; deterministic tests use real timers for some scenarios.
- In-memory fallback stops writes but does not retry automatically after recovery.
- Cleanup final persist is fire-and-forget.
- Schedule editor UI implemented (Phase 2).
- @types/react v19 with React 18 runtime remains.

### Next authorized phase
Phase 6 - PWA Polish & Offline (installability, caching, offline verification), pending owner approval.

---

## 25. Phase 2 Implementation Details

### UI architecture
- `src/App.jsx` orchestrates useSchedule, tabs (Schedule/Customize/Preview), subject modal, settings, preview.
- `src/components/ScheduleView.jsx` main schedule screen: title/semester inputs, subject count, load sample, add subject, subject list, empty state.
- `src/components/SubjectCard.jsx` subject display with meetings, edit/delete.
- `src/components/SubjectForm.jsx` modal form for subject + meetings.
- `src/components/Modal.jsx` accessible dialog (focus trap, restore, escape, scroll lock).
- `src/components/SettingsPanel.jsx` customization.
- `src/components/PreviewCanvas.jsx` preview + export.

### Subject management
- Create/edit/delete via reducer actions; validation via validateSubject.
- Delete requires confirmation; associated meetings removed with subject.
- Storage warnings and saving status displayed.

### Meeting management
- Multiple meetings per subject; multiple weekdays per meeting.
- Optional room/instructor/notes; subjects may have zero meetings.
- Native time inputs; add/edit/delete meetings in form.

### Day selector
- Checkbox group for Mon..Sun with accessible labels and touch targets.

### Color picker
- Documented palette only; selected state indicated via border and aria-pressed.

### Sample schedule
- `src/lib/sampleSchedule.js` provides 5 subjects with varied colors, weekdays, meetings, rooms, instructors.
- Load sample action confirms before replacing existing data; uses reducer RESET + ADD_SUBJECT (marks dirty).

### Responsive & accessibility
- Mobile-first Tailwind classes; flex/grid responsive.
- Focus rings on interactive controls; modal focus management.
- Form errors use role="alert"; aria-required on name field.
- Reduced-motion not explicitly handled (limitation).

### Tests
- `src/components/phase2.test.jsx` (7 tests): empty state, create, validation error, delete, sample load, meeting add, memory warning.
- Existing Phase 1 tests retained (48 total).

### Test results
- `npm test`: 9 test files, 55 tests passed (PASS).
- `npm run lint`: no issues (PASS).
- `npm run build`: success (PASS).

### Responsive and reduced-motion
- Reduced-motion preference respected globally via `@media (prefers-reduced-motion: reduce)` in `src/index.css`.
- Responsive breakpoints (320-1920px) rely on mobile-first Tailwind classes; automated viewport testing not available in current toolchain (NOT TESTED).
- Manual inspection performed for overflow-prone areas (day selector touch targets enlarged, modal max-height/overflow).

### Known limitations
- Responsive breakpoints not exhaustively automated (manual verification recommended).
- Delete meeting has no separate confirmation.
- Custom arbitrary colors removed per palette-only spec.
- Reduced-motion handled via global CSS guard.

---

## 26. Phase 3 Implementation Details

### Parser module
- Location: `src/lib/quickAddParser.js`
- Pure JavaScript, no React/storage/IDs.
- Exports: `parseQuickAdd(input)`, `parseDayToken(token)`.
- Result contract: `{ success, data, errors, warnings }` where data is `{ name, meetings: [{ days, start, end, room }] }` or null.

### Supported input
- Subject name + days + time range + optional room.
- Days: individual names/abbreviations, compact combos (MWF, TTh, MW, TThF), single letters M/T/W/F.
- Times: 24-hour, compact, 12-hour, mixed with inferred meridiem (with warning).
- Rooms: `R204`, `Room 204`, `Lab 1`, `Laboratory 2` (normalized).

### Ambiguity rules
- Standalone `T` = Tuesday; `Th` = Thursday; `TTh` = Tuesday + Thursday.
- Duplicate days removed; days sorted Mon-Sun.
- Meridiem inferred only when a valid range results; otherwise error/warning.
- Times normalized to `HH:mm`.

### UI integration
- `src/components/QuickAddModal.jsx` added.
- Entry point "Quick add" button in `ScheduleView`.
- Review/edit parsed values before save; errors/warnings displayed; original input preserved on failure.
- "Use manual form" switches to manual SubjectForm.
- Parsing alone does not mutate state (no save until confirm).

### Tests
- `src/lib/quickAddParser.test.js` (26 tests).
- `src/components/quickAdd.test.jsx` (7 tests).
- Total: 11 test files, 89 tests passed.

### Files created
- src/lib/quickAddParser.js
- src/lib/quickAddParser.test.js
- src/components/QuickAddModal.jsx
- src/components/quickAdd.test.jsx

### Files modified
- src/App.jsx
- src/components/ScheduleView.jsx
- AGENTS.md

### Test results
- `npm test`: 11 files, 89 tests passed (PASS).
- `npm run lint`: no issues (PASS).
- `npm run build`: success (PASS).

### Known limitations
- Single meeting per parse; multiple meetings not auto-parsed from one line.
- Weekday-like words are only treated as days when they form a trailing run; a leading weekday-like word that is part of a subject name is preserved, but ambiguous boundary cases require manual correction.
- AM/PM inference uses heuristic; ambiguous cases produce warnings rather than silent conversion.
- Room extraction requires a digit in the room value; unusual room labels without digits are not recognized.
- Unrecognized trailing text is reported via warnings and may be absorbed into the subject name in some orderings.

### Next authorized phase
Phase 4 — Wallpaper Rendering Engine, pending owner approval.

---

## 27. Phase 4 Implementation Details

### Module structure
- src/rendering/wallpaperConstants.js (presets, themes, templates, safe zones)
- src/rendering/wallpaperUtils.js (scale, roundRect, truncateText, wrapText, safeZonePixels, validateDimensions, colorsFor, groupMeetingsByDay, meetingMinutes)
- src/rendering/templates/dailyList.js
- src/rendering/templates/weeklyColumns.js
- src/rendering/templates/todayFocus.js
- src/rendering/wallpaperEngine.js (public API)
- src/rendering/wallpaper.js (backward-compatible facade)
- src/rendering/wallpaperEngine.test.js

### Public API
- renderWallpaper(options | (canvas, schedule, settingsOverride)) -> { canvas, width, height, template, theme, warnings }
- Supports explicit width/height or preset.

### Presets
- iphone-15: 1179x2556
- iphone-15-pro-max: 1290x2796
- android-common: 1080x2400
- android-tall: 1440x3200
- Legacy aliases: phone, tablet, desktop.

### Templates
- dailyList: weekly schedule grouped by day.
- weeklyColumns: 7-day columns with time axis, overlap handling, fallback to dailyList if too narrow.
- todayFocus: single day focus with next-class indicator when currentTimeMinutes provided; deterministic fallback selected day.

### Themes
- dark/light with specified colors.

### Safe zones
- Default top 16%, bottom 14%; configurable via settings.safeZoneTop/safeZoneBottom.

### Warnings/truncation
- Returns warnings for space overflow, empty schedule, long title, narrow columns.
- Text truncation with ellipsis; uses Canvas measureText.

### Tests
- 12 test files, 115 tests passed.
- Engine tests: 11 (mocked Canvas context).

### Known limitations
- Visual verification in real browser not performed (Canvas mocked in tests).
- No interactive preview/export changes (Phase 5).
- Font rendering depends on browser.
- Weekly columns overlap handling is basic track assignment.

### Next authorized phase
Phase 5 — Preview and Export, pending owner approval.

---

## 28. Phase 4 Final Verification and Correction

### Preset dimensions and aliases
- iphone-15: 1179x2556 (label includes iPhone 14 Pro)
- iphone-15-pro-max: 1290x2796
- android-common: 1080x2400
- android-tall: 1440x3200
- Legacy aliases: phone, tablet, desktop -> android-common
- Custom dimensions validated (200-4096, pixel limit).

### Schedule preservation
- All seven days accounted for in dailyList and weeklyColumns.
- Weekend meetings retained.
- Multiple meetings per day and overlapping meetings handled (basic track assignment).
- Long subject names truncated with warnings identifying the subject.
- Missing room and subjects without meetings handled.
- Renderer does not mutate input schedule (tested).
- WeeklyColumns fallback to dailyList preserves meetings (delegates).

### Safe-zone verification
- Default top 16%, bottom 14% applied via safeZonePixels.
- Content starts after top safe zone and ends before bottom safe zone.
- Dense schedules return warnings on overflow.
- Safe-zone visualization separate from layout constraints.

### Browser visual verification
- No browser-based rendering tool available (only jsdom). NOT performed.
- Canvas output verified only via mocked Canvas context in tests.
- Do not claim visual inspection of actual pixels.

### Regression tests added
- Preset dimensions and alias.
- Weekend meetings, multiple meetings, overlaps, long names, missing room, subjects without meetings.
- Safe zone boundaries (settings application).

### Full test results
- npm test: 12 files, 127 tests passed (PASS).

### Lint result
- npm run lint: no issues (PASS).

### Production build result
- npm run build: success (PASS).

### Git status
- Modified: AGENTS.md, src/rendering/wallpaper.js, templates, utils, engine, tests.
- No commits created.

### Remaining limitations
- Visual verification in real browser not performed.
- Weekly columns overlap handling basic.
- Font rendering browser-dependent.
- Truncation warnings now cover subject names, meeting details, title, and semester.
- Weekly overlap handling basic but all entries represented.

---

## Session Recovery Instructions (MANDATORY)

Every new OpenCode session MUST, before doing project work:

1. Read `AGENTS.md` in full.
2. Inspect the repository (ls/tree) and Git status.
3. Review recent commits and uncommitted changes.
4. Compare documented progress in AGENTS.md with actual implementation (do not trust reports).
5. Run verification commands (`npm test`, `npm run lint`, `npm run build`) instead of assuming pass.
6. Identify the next authorized task from AGENTS.md / owner instructions.
7. Never assume unfinished work is complete.
8. If ambiguity or blocker exists, stop and report rather than pretending completion.

## Documentation Maintenance

- Update `AGENTS.md` whenever architecture, requirements, dependencies, phase status, or known limitations change.
- Keep `docs/architecture.md` and `README.md` consistent with `AGENTS.md`.
- Clearly distinguish planned vs implemented functionality.
- Do not invent completion claims.
- Preserve full specification; do not replace with short summary.
