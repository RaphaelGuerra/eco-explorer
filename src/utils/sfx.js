class SfxManager {
  constructor() {
    this.enabled = true
    this.buffers = {}
    this.ctx = null
  }
  async init() {
    if (this.ctx) return
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    } catch {
      // audio not available; keep silent fallback
    }
  }
  toggle() {
    this.enabled = !this.enabled
  }
  async play(name) {
    if (!this.enabled) return
    try {
      await this.init()
      const buffer = await this.getBuffer(name)
      if (!buffer || !this.ctx) return
      const src = this.ctx.createBufferSource()
      src.buffer = buffer
      src.connect(this.ctx.destination)
      src.start(0)
    } catch {
      // ignore sfx errors
    }
  }
  async getBuffer(name) {
    if (this.buffers[name]) return this.buffers[name]
    const data = this.generate(name)
    const buffer = this.ctx.createBuffer(1, data.length, 44100)
    buffer.copyToChannel(data, 0)
    this.buffers[name] = buffer
    return buffer
  }
  generate(name) {
    const length = 4410 // 0.1s
    const arr = new Float32Array(length)
    const freq = name === 'success' ? 880 : name === 'scan' ? 440 : name === 'focus' ? 660 : 550
    for (let i = 0; i < length; i++) {
      const t = i / 44100
      const env = Math.exp(-20 * t)
      arr[i] = Math.sin(2 * Math.PI * freq * t) * env
    }
    return arr
  }
}

const sfx = new SfxManager()
export default sfx
