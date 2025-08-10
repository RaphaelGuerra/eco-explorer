export async function captureElementToPng(element) {
  const scale = 2
  const rect = element.getBoundingClientRect()
  const canvas = document.createElement('canvas')
  canvas.width = rect.width * scale
  canvas.height = rect.height * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  // Simple draw: background and text snapshot
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, rect.width, rect.height)
  // Rasterize DOM minimally (emoji + texts)
  const emoji = element.querySelector('.emoji')?.textContent || '🌿'
  const title = element.querySelector('h3')?.textContent || ''
  const lines = Array.from(element.querySelectorAll('p')).map(p => p.textContent)
  ctx.fillStyle = '#fff'
  ctx.font = '48px sans-serif'
  ctx.fillText(emoji, 20, 60)
  ctx.font = '20px sans-serif'
  ctx.fillText(title, 80, 60)
  ctx.font = '14px sans-serif'
  lines.slice(0, 4).forEach((line, i) => ctx.fillText(line || '', 20, 100 + i * 22))
  return canvas.toDataURL('image/png')
}

export function downloadDataUrl(filename, dataUrl) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}
