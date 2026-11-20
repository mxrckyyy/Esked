---
trigger: glob
globs:
  - "src/components/**"
  - "src/index.css"
  - "src/App.jsx"
description: "Esked mobile-first UI redesign specification"
---

# Esked Mobile-First UI Redesign Specification

> This rule file defines the complete design system, component specs, layout
> breakpoints, and visual targets for the Esked UI redesign. Every UI phase
> must follow this specification exactly. **Never modify rendering/export files.**

---

## 1. Design Identity

- **Brand color:** Green (#129C74 light / #22B38A dark) — used for accent, focus, success, active indicators.
- **Aesthetic:** Clean, modern, student-friendly. Rounded corners, generous whitespace, no heavy shadows or glassmorphism.
- **Motion:** Subtle transitions only (120ms micro, 200ms standard, 320ms overlays). Respect `prefers-reduced-motion`.

---

## 2. Design Tokens (CSS Custom Properties)

All tokens are already defined in `src/index.css` on `:root` (light) and `.dark` (dark).
Do **not** duplicate or override them. Reference the existing tokens:

### Colors
| Token              | Light       | Dark        | Usage                        |
|--------------------|-------------|-------------|------------------------------|
| `--canvas`         | #F8F8F5     | #0F1412     | Page background              |
| `--surface`        | #FFFFFF     | #171D1A     | Cards, inputs, panels        |
| `--surface-raised` | #FBFBF9     | #141A17     | Hover/raised surfaces        |
| `--ink`            | #1F2933     | #E8EEEA     | Primary text                 |
| `--ink-2`          | #374151     | #B0BAB4     | Secondary text               |
| `--ink-3`          | #475569     | #9AA6A0     | Tertiary/muted text          |
| `--line`           | #E2E7E3     | #26302B     | Borders, dividers            |
| `--line-strong`    | #D5DAD6     | #34413A     | Input borders, strong lines  |
| `--accent`         | #129C74     | #22B38A     | Buttons, links, active state |
| `--accent-ink`     | #0F1412     | #0F1412     | Text on accent backgrounds   |
| `--accent-tint`    | #DDF3E8     | #12372C     | Accent backgrounds, pills    |
| `--accent-icon-bg` | #E4F4EC     | #12372C     | Icon circle backgrounds      |
| `--focus`          | #129C74     | #22B38A     | Focus ring color             |
| `--warn`           | #B45309     | #fbbf24     | Warnings                     |
| `--danger`         | #B91C1C     | #f87171     | Destructive actions          |
| `--danger-border`  | #F0CFCF     | #5a2a2a     | Danger borders               |
| `--success`        | #129C74     | #22B38A     | Success states               |
| `--chip`           | #EEF0EE     | #1E2A24     | Chip/badge backgrounds       |
| `--safe-fill`      | #FFF6DB     | #2a2410     | Safe-zone fill               |
| `--safe-stroke`    | #E0A800     | #E0A800     | Safe-zone stroke             |
| `--safe-text`      | #8A6A00     | #E0A800     | Safe-zone labels             |

### Typography
| Token          | Value       | Purpose            |
|----------------|-------------|---------------------|
| `--text-xs`    | 0.75rem     | Badges, captions    |
| `--text-sm`    | 0.8125rem   | Secondary text      |
| `--text-base`  | 0.9375rem   | Body text           |
| `--text-md`    | 1rem        | Inputs, controls    |
| `--text-lg`    | 1.125rem    | Section headings    |
| `--text-xl`    | 1.3125rem   | Page headings       |
| `--text-2xl`   | 1.625rem    | Hero headings       |
| `--text-3xl`   | 2.75rem     | Desktop hero (44px) |

### Font Stack
```
--font-ui: 'Lato', system-ui, 'Segoe UI', sans-serif;
```
Lato 400 + 700 self-hosted in `public/fonts/` with `font-display: swap`. **No external CDN.**

### Spacing (4px base)
Use `--space-{n}` tokens or Tailwind's default spacing. Scale: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), 10 (40px), 12 (48px), 16 (64px), 24 (96px).

### Radii
| Token              | Value    | Usage                      |
|--------------------|----------|----------------------------|
| `--radius-control` | 0.5rem   | Inputs, checkboxes         |
| `--radius-button`  | 0.625rem | Buttons                    |
| `--radius-container` | 1rem  | Cards, panels              |
| `--radius-dialog`  | 1.125rem | Modals, bottom sheets      |
| `--radius-badge`   | 9999px   | Pills, chips, badges       |

### Elevation
| Token             | Usage                      |
|-------------------|----------------------------|
| `--shadow-card`   | Cards (subtle)             |
| `--shadow-overlay`| Modals, dropdowns, sheets  |

### Motion
| Token            | Value  | Usage              |
|------------------|--------|--------------------|
| `--dur-micro`    | 120ms  | Hover, press       |
| `--dur-standard` | 200ms  | Transitions        |
| `--dur-overlay`  | 320ms  | Modal enter/exit   |
| `--ease-out`     | cubic-bezier(0.16,1,0.3,1) | Opening   |
| `--ease-in`      | cubic-bezier(0.4,0,1,1)    | Closing   |

---

## 3. Responsive Breakpoints & Content Widths

| Breakpoint | Container max-width | Layout                              |
|------------|---------------------|--------------------------------------|
| < 640px    | 100% (16px padding) | Single column, stacked, bottom nav   |
| ≥ 640px    | 640px               | Still single column                  |
| ≥ 768px    | 960px               | Desktop header (no bottom nav)       |
| ≥ 1024px   | 1280px              | Two-column layouts, footer visible   |
| ≥ 1440px   | 1360px              | Maximum content width                |

Container class: `.app-container` (already exists in `index.css`).

---

## 4. Component Specifications

### 4.1 Button

Variants: `primary`, `outline`, `danger-outline`, `icon-only`.
Sizes: `sm` (36px height), `md` (44px height, default), `lg` (48px height).

| Variant         | Background        | Text             | Border            |
|-----------------|-------------------|------------------|-------------------|
| primary         | `--accent`        | `--accent-ink`   | none              |
| outline         | transparent       | `--ink-2`        | `--line-strong`   |
| danger-outline  | transparent       | `--danger`       | `--danger-border` |
| icon-only       | transparent       | `--ink-2`        | `--line`          |

States:
- **Hover** (desktop only): lighten/darken bg by opacity (primary → `accent/90`, outline → `surface-raised`)
- **Focus-visible**: 2px ring `--focus`, 2px offset
- **Pressed**: scale(0.98) for 120ms
- **Disabled**: `opacity: 0.5`, `cursor: not-allowed`
- **Loading**: spinner replaces content, disabled

Minimum touch target: 44×44px for all interactive elements.

### 4.2 Chip / Badge
- Background: `--chip`
- Text: `--ink-2`, `--text-xs`, `font-medium`
- Radius: `--radius-badge` (full pill)
- Padding: `--space-1` vertical, `--space-3` horizontal

### 4.3 Card
- Background: `--surface`
- Border: 1px `--line`
- Radius: `--radius-container`
- Padding: `--space-4`
- No shadow by default; use `--shadow-card` only when elevated

### 4.4 Field (Label + Input/Select)
- Label: `--text-xs`, `font-medium`, `--ink-3`, uppercase tracking
- Input: `--text-sm`, `--surface` bg, 1px `--line-strong` border, `--radius-control`, height 48px for selects with icons
- Leading icon: 16px, `--ink-3`, inside the label row
- Focus: 2px ring `--focus`

### 4.5 Switch (Toggle)
- Track: 44×24px, `--line-strong` off, `--accent` on
- Thumb: 20px circle, white, centered vertically
- Transition: `--dur-standard`
- Label: left-aligned text, switch right-aligned

### 4.6 Checkbox
- Size: 16×16px
- Border: `--line-strong`, radius `--radius-control`
- Checked: `--accent` background, white checkmark

### 4.7 Stepper (Zoom controls)
- Three inline buttons: minus / value label / plus
- Button style: `outline` variant, `sm` size
- Value: `--text-sm`, centered, min-width 48px

---

## 5. App Shell Layout

### Mobile (< 768px)
- **Header**: 56px height, `--surface` bg, border-bottom `--line`
  - Left: "Esked" brand (text-xl, font-semibold)
  - Right: ThemeToggle (44×44px icon button)
- **Bottom tab bar**: fixed bottom, `--surface` bg, border-top `--line`, safe-area padding
  - Three tabs: Schedule, Customize, Preview
  - Active tab: green pill background (`--accent-tint`), `--accent` text, `aria-current="page"`
  - Inactive: `--ink-3` text
  - Each tab: icon (20px) + label (text-xs), flex-col centered
  - Tab hit area: minimum 44×44px
- **Content**: padding-bottom = tab bar height + safe-area

### Desktop (≥ 768px)
- **Header**: `--surface` bg, border-bottom `--line`
  - Left: "Esked" brand + tagline ("Offline-first schedule wallpapers", `--ink-3`, `--text-sm`)
  - Center/Right: Tab pills in a nav row (active = `--accent` bg + `--accent-ink` text, inactive = border `--line` + `--ink-2`)
  - Far right: ThemeToggle
- **Bottom nav**: hidden (`md:hidden`)
- **Footer** (≥ 1024px): storage status text, `--text-xs`, `--ink-3`

---

## 6. Page Layouts

### 6.1 Schedule Page

**Mobile (< 1024px):**
- Title row: green circle icon (40px, `--accent-tint` bg) + "My Schedule" heading + semester chip
- Schedule identity inputs: title + semester in responsive grid
- Action toolbar: "Quick Add" + "Load sample" (outline), "Add subject" (primary, full-width on mobile)
- Subject statistics: count / meetings / weekly hours (computed, never hardcoded)
- "Subjects" heading
- Subject cards stacked in a list
- "Add another subject" dashed-border row at bottom
- Empty state when no subjects

**Desktop (≥ 1024px):**
- Two-column: `grid-cols-[1.9fr_1fr]`
- Left: schedule list (with column headers and labeled Edit/Delete buttons)
- Right: settings panel + live preview card with Download PNG / Share

### 6.2 SubjectCard
- Card container with color dot (16px circle, subject color, `aria-hidden`)
- Subject name (font-semibold), Edit + Delete buttons (44px hit areas, `aria-label`)
- Meeting list: tabular-nums, "Day · Start–End · Room · Instructor"
- Notes below meetings

### 6.3 Customize Page

**Mobile:**
- Heading: "Customize your wallpaper" + subtitle
- Three labeled 48px select fields with leading icons: Template, Wallpaper theme, Wallpaper size
- Custom dimensions inputs when "Custom" selected
- Three toggle rows: Show room, Show time, Show safe zones
- Hint text: "Changes update the preview instantly."
- Full-width "See preview" button (mobile only, navigates to Preview tab)

**Desktop (≥ 1024px):**
- Two-column: settings left, live phone mockup preview right with Download/Share

### 6.4 Preview Page

**Mobile:**
- Heading: "Preview" + "Your wallpaper is ready."
- Phone mockup wrapper: rounded frame, border, shadow, responsive scaling
- Controls: Safe zones checkbox, Zoom stepper (−/value/+/Reset)
- Download PNG (primary, full-width) + Share (outline, full-width)
- Output info: "Output: W × Hpx"

**Desktop (≥ 1024px):**
- Larger mockup centered
- Controls card alongside

---

## 7. Phone Mockup & Week Preview

### PhoneMockup wrapper
- Rounded container: `rounded-[2rem]`, border `--line`, `--surface-raised` bg, `--shadow-overlay`
- Inner content: `rounded-[1.5rem]`, border `--line`
- Responsive max-width: `max-w-xs` → `sm:max-w-sm` → `md:max-w-md`
- Aspect ratio preserved via canvas dimensions

### Week Preview
- Uses the existing `renderWallpaper()` engine — **single source of truth**
- Safe-zone bands: dashed lines at top/bottom, labeled "Safe zone" when enabled
- Subject blocks use subject colors from data
- Preview-only overlay; not included in PNG export

---

## 8. Dialogs

### Add/Edit Subject (SubjectForm)
**Mobile:** Bottom sheet
- Rounded top corners (`rounded-t-2xl`)
- Max height: `90dvh`
- Drag handle at top (optional decorative)
- Sticky Save + Cancel at bottom
- Safe-area bottom padding

**Desktop (≥ 640px):** Centered modal
- Max width: 480px (`sm:max-w-lg`)
- Rounded corners: `--radius-dialog`

**Form contents:**
- Name field (required, `aria-required`)
- Color swatches (8 colors, 44×44px buttons, `aria-pressed`)
- Notes textarea
- Meeting rows: day checkboxes, start/end time, room, instructor, notes, remove
- Inline validation: end must be after start → danger left border + error text
- "Add meeting" button

### Delete Confirmation (ConfirmDialog)
- Focus trap, Escape to close
- Title, description, "Keep subject" (outline) + "Delete subject" (danger)
- Initial focus on safe action ("Keep subject")

### Load Sample Confirmation
- Same modal pattern as Delete
- "Keep current" + "Load sample" buttons

---

## 9. Empty States

### No subjects (normal storage)
- Dashed border container, centered
- Calendar icon (`--accent`)
- "No subjects yet" heading
- Description text
- "Add subject" primary button

### Storage unavailable
- Warning-tinted container (`--warn`)
- Warning triangle icon
- "Storage unavailable" heading
- Explanation text (memory-only warning)

---

## 10. Notices & Status

- Storage warning: `--warn` border/bg/text, rounded card
- Error: `--danger` border/bg/text, rounded card, `role="alert"`
- Form error: same as error
- Non-critical notices (offline, update, install, iOS): single slot, never overlapping
- Footer status: "Saving…" / "Saved locally" / "Memory only", `aria-live="polite"`

---

## 11. Accessibility Requirements

- Semantic HTML: `<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`, `<article>`
- Skip link to `#main`
- `aria-current="page"` on active nav tab
- `aria-label` on icon-only buttons
- `aria-invalid` + `aria-describedby` for form errors
- `aria-live` regions for dynamic status
- Focus trap in modals/dialogs
- Focus restored on dialog close
- Minimum touch target: 44×44px
- Contrast: 4.5:1 for text, 3:1 for meaningful icons/borders
- `prefers-reduced-motion: reduce` → disable all animations

---

## 12. Icon Strategy

Currently using inline SVGs (no library). Icons are 16–24px, `stroke="currentColor"`, `aria-hidden="true"`.
Lucide React is listed as optional in `AGENTS.md` but **not installed**. Keep using inline SVGs unless explicitly directed to add Lucide.

---

## 13. Files That Must NOT Change

These files contain the canvas rendering and PNG export logic. **Do not modify them:**

- `src/rendering/wallpaperEngine.js`
- `src/rendering/wallpaperConstants.js`
- `src/rendering/wallpaperUtils.js`
- `src/rendering/wallpaper.js`
- `src/rendering/export.js`
- `src/rendering/templates/dailyList.js`
- `src/rendering/templates/weeklyColumns.js`
- `src/rendering/templates/todayFocus.js`

---

## 14. Files That Must NOT Change (Data/Logic)

These files contain business logic and data persistence. **Do not modify them:**

- `src/lib/model.js`
- `src/lib/scheduleReducer.js`
- `src/lib/quickAddParser.js`
- `src/lib/sampleSchedule.js`
- `src/lib/ids.js`
- `src/storage/db.js`
- `src/storage/scheduleRepository.js`
- `src/hooks/useSchedule.js`
- `src/hooks/useOnlineStatus.js`
- `src/hooks/usePwaInstall.js`
- `src/hooks/useServiceWorkerUpdate.js`

---

## 15. Theme Switch Rules

- App UI theme (`useTheme` hook) is independent of wallpaper theme (`settings.theme`)
- Theme persisted to `localStorage` key `esked:theme`
- FOUC prevention: inline script in `index.html` applies `.dark` class before paint
- `color-scheme` CSS property set on `<html>`
- Do not change the theme persistence mechanism

---

## 16. PWA & Offline Rules

- No external network requests (fonts, icons, scripts)
- All assets must be covered by Workbox glob: `**/*.{js,css,html,ico,png,svg,woff2}`
- Service worker: `registerType: 'prompt'`, precaches app shell
- Standalone display, portrait orientation
- Do not break the manifest or service worker configuration

---

## 17. Testing

- Vitest + React Testing Library + jsdom
- Existing tests must continue to pass after UI changes
- Test setup in `src/test/setup.js` includes canvas context polyfill
- Run `npm test`, `npm run lint`, `npm run build` after every phase
