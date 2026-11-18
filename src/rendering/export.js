export function downloadCanvas(canvas, filename = 'esked-wallpaper.png') {
  if (!canvas || typeof canvas.toBlob !== 'function') {
    return Promise.reject(new Error('Canvas export not supported'))
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate PNG'))
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      resolve(blob)
    }, 'image/png')
  })
}

export async function shareCanvas(canvas, filename = 'esked-wallpaper.png') {
  if (!canvas || typeof canvas.toBlob !== 'function') throw new Error('Canvas export not supported')
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to generate PNG'))), 'image/png')
  })
  if (!navigator.share || !navigator.canShare) {
    throw new Error('Web Share not supported')
  }
  const file = new File([blob], filename, { type: 'image/png' })
  if (!navigator.canShare({ files: [file] })) {
    throw new Error('Sharing files not supported')
  }
  await navigator.share({ files: [file], title: 'Esked Wallpaper' })
}

export function isShareSupported() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function' && typeof navigator.canShare === 'function'
}
