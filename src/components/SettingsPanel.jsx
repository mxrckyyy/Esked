import { useState } from 'react'
import { WALLPAPER_PRESETS, LEGACY_TEMPLATE_MAP } from '../rendering/wallpaper.js'

const TEMPLATE_OPTIONS = [
  { value: 'dailyList', label: 'Daily List' },
  { value: 'weeklyColumns', label: 'Weekly Columns' },
  { value: 'todayFocus', label: 'Today Focus' },
]

function normalizeTemplate(t) {
  return LEGACY_TEMPLATE_MAP[t] || t
}

export function SettingsPanel({ settings, onChange }) {
  const [custom, setCustom] = useState(settings.wallpaperPreset === 'custom')
  function set(key, value) {
    onChange({ [key]: value })
  }
  const templateValue = normalizeTemplate(settings.template)
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Customize</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="template">
            Template
          </label>
          <select
            id="template"
            value={templateValue}
            onChange={(e) => set('template', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {TEMPLATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="theme">
            Theme
          </label>
          <select
            id="theme"
            value={settings.theme}
            onChange={(e) => set('theme', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="preset">
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
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.entries(WALLPAPER_PRESETS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
            <option value="custom">Custom dimensions</option>
          </select>
        </div>
        {custom || settings.wallpaperPreset === 'custom' ? (
          <div className="sm:col-span-2 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="custom-w">
                Width
              </label>
              <input
                id="custom-w"
                type="number"
                value={settings.width || ''}
                onChange={(e) => set('width', Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="custom-h">
                Height
              </label>
              <input
                id="custom-h"
                type="number"
                value={settings.height || ''}
                onChange={(e) => set('height', Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showRoom}
            onChange={(e) => set('showRoom', e.target.checked)}
          />
          Show room
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showTime}
            onChange={(e) => set('showTime', e.target.checked)}
          />
          Show time
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showSafeZones}
            onChange={(e) => set('showSafeZones', e.target.checked)}
          />
          Show safe zones
        </label>
      </div>
    </section>
  )
}