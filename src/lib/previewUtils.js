export function presetDims(settings) {
  const p = settings?.wallpaperPreset
  const map = {
    'iphone-15': [1179, 2556],
    'iphone-15-pro-max': [1290, 2796],
    'android-common': [1080, 2400],
    'android-tall': [1440, 3200],
    phone: [1080, 1920],
    tablet: [1200, 1600],
    desktop: [1920, 1080],
  }
  if (p === 'custom') {
    const w = Number(settings?.width)
    const h = Number(settings?.height)
    if (w > 0 && h > 0) return [w, h]
  }
  return map[p] || [1080, 2400]
}

export function getSubjectInitials(name) {
  if (!name) return ''
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return name.slice(0, 3).toUpperCase()
  return words.map((w) => w[0]).join('').slice(0, 4).toUpperCase()
}
