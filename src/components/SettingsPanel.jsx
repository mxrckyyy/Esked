import { WALLPAPER_PRESETS } from '../rendering/wallpaper.js'

export function SettingsPanel({ settings, onChange }) {
  function set(key, value) {
    onChange({ [key]: value })
  }
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
            value={settings.template}
            onChange={(e) => set('template', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="classic">Classic Grid</option>
            <option value="compact">Compact List</option>
            <option value="minimal">Minimal</option>
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
            onChange={(e) => set('wallpaperPreset', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.entries(WALLPAPER_PRESETS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
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
