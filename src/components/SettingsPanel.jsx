import { useState } from 'react'
import { WALLPAPER_PRESETS, LEGACY_TEMPLATE_MAP } from '../rendering/wallpaper.js'
import { Switch } from './ui/Switch.jsx'
import { Button } from './ui/Button.jsx'

const TEMPLATE_OPTIONS = [
  { value: 'dailyList', label: 'Daily List' },
  { value: 'weeklyColumns', label: 'Weekly Columns' },
  { value: 'todayFocus', label: 'Today Focus' },
]

function normalizeTemplate(t) {
  return LEGACY_TEMPLATE_MAP[t] || t
}

const IconTemplate = (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
)

const IconTheme = (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
)

const IconSize = (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
)

export function SettingsPanel({ settings, onChange, onSeePreview }) {
  const [custom, setCustom] = useState(settings.wallpaperPreset === 'custom')

  function set(key, value) {
    onChange({ [key]: value })
  }

  const templateValue = normalizeTemplate(settings.template)

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Customize your wallpaper</h2>
        <p className="mt-1 text-sm text-ink-3">Tailor your schedule to your style.</p>
      </div>

      {/* 3 Labeled 48px Select Fields with Icons */}
      <div className="space-y-4">
        {/* Template Select (48px) */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-3" htmlFor="template">
            <span className="text-accent">{IconTemplate}</span>
            Template
          </label>
          <select
            id="template"
            value={templateValue}
            onChange={(e) => set('template', e.target.value)}
            className="h-12 w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {TEMPLATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Wallpaper Theme Select (48px) */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-3" htmlFor="theme">
            <span className="text-accent">{IconTheme}</span>
            Wallpaper theme
          </label>
          <select
            id="theme"
            value={settings.theme}
            onChange={(e) => set('theme', e.target.value)}
            className="h-12 w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Wallpaper Size Select (48px) */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-3" htmlFor="preset">
            <span className="text-accent">{IconSize}</span>
            Wallpaper size
          </label>
          <select
            id="preset"
            value={settings.wallpaperPreset}
            onChange={(e) => {
              const v = e.target.value
              setCustom(v === 'custom')
              set('wallpaperPreset', v)
            }}
            className="h-12 w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {Object.entries(WALLPAPER_PRESETS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
            <option value="custom">Custom dimensions</option>
          </select>
        </div>
      </div>

      {/* Custom Dimensions if selected */}
      {(custom || settings.wallpaperPreset === 'custom') ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-ink-3" htmlFor="custom-w">
              Width (px)
            </label>
            <input
              id="custom-w"
              type="number"
              value={settings.width || ''}
              onChange={(e) => set('width', Number(e.target.value))}
              className="h-11 w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-ink-3" htmlFor="custom-h">
              Height (px)
            </label>
            <input
              id="custom-h"
              type="number"
              value={settings.height || ''}
              onChange={(e) => set('height', Number(e.target.value))}
              className="h-11 w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>
        </div>
      ) : null}

      {/* 3 Toggle Rows with Switch */}
      <div className="space-y-2 border-t border-line pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Display options</p>
        <div className="space-y-1 divide-y divide-line/60">
          <Switch
            label="Show room"
            checked={!!settings.showRoom}
            onChange={(val) => set('showRoom', val)}
          />
          <Switch
            label="Show time"
            checked={!!settings.showTime}
            onChange={(val) => set('showTime', val)}
          />
          <Switch
            label="Show safe zones"
            checked={!!settings.showSafeZones}
            onChange={(val) => set('showSafeZones', val)}
          />
        </div>
      </div>

      <p className="text-xs text-ink-3">Changes update the preview instantly.</p>

      {/* Full-width "See preview" button (Mobile only) */}
      {onSeePreview ? (
        <Button
          variant="primary"
          size="lg"
          onClick={onSeePreview}
          className="w-full lg:hidden"
        >
          See preview
        </Button>
      ) : null}
    </section>
  )
}
