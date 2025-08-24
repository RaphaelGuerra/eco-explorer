class SfxManager {
  constructor() {
    this.enabled = true
    this.buffers = {}
    this.ctx = null
    this.ambientSources = new Map() // Track ambient audio sources
    this.currentAmbient = null
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
    if (!this.enabled) {
      this.stopAllAmbient()
    }
  }

  // Ambient audio management
  async playAmbient(name) {
    if (!this.enabled) return

    // Stop current ambient if different
    if (this.currentAmbient && this.currentAmbient !== name) {
      this.stopAmbient(this.currentAmbient)
    }

    if (this.ambientSources.has(name)) {
      return // Already playing
    }

    try {
      await this.init()
      const buffer = await this.getBuffer(name)
      if (!buffer || !this.ctx) return

      const src = this.ctx.createBufferSource()
      const gainNode = this.ctx.createGain()

      src.buffer = buffer
      src.loop = true
      gainNode.gain.value = 0.3 // Low volume for ambient

      src.connect(gainNode)
      gainNode.connect(this.ctx.destination)
      src.start(0)

      this.ambientSources.set(name, { source: src, gain: gainNode })
      this.currentAmbient = name
    } catch {
      // ignore ambient audio errors
    }
  }

  stopAmbient(name) {
    const ambient = this.ambientSources.get(name)
    if (ambient) {
      try {
        ambient.source.stop()
      } catch {
        // Already stopped
      }
      this.ambientSources.delete(name)
      if (this.currentAmbient === name) {
        this.currentAmbient = null
      }
    }
  }

  stopAllAmbient() {
    for (const [name] of this.ambientSources) {
      this.stopAmbient(name)
    }
  }

  fadeAmbient(name, targetVolume, duration = 2) {
    const ambient = this.ambientSources.get(name)
    if (ambient) {
      const currentTime = this.ctx.currentTime
      ambient.gain.gain.setValueAtTime(ambient.gain.gain.value, currentTime)
      ambient.gain.gain.linearRampToValueAtTime(targetVolume, currentTime + duration)
    }
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
    // Different durations for different sound types
    let length, frequencies, envelope

    switch (name) {
      // Interactive feedback sounds
      case 'discovery_chime':
        length = 22050 // 0.5s
        frequencies = [523, 659, 784] // C5, E5, G5
        envelope = (t) => Math.exp(-8 * t) * (0.8 + 0.2 * Math.sin(2 * Math.PI * 8 * t))
        break

      case 'sonar_ping':
        length = 11025 // 0.25s
        frequencies = [220, 440, 880] // A3, A4, A5
        envelope = (t) => Math.exp(-15 * t) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 20 * t))
        break

      case 'success_flourish':
        length = 44100 // 1s
        frequencies = [440, 554, 659, 880, 1109] // A4, C#5, E5, A5, C#6
        envelope = (t) => Math.exp(-3 * t) * (0.7 + 0.3 * Math.sin(2 * Math.PI * 2 * t))
        break

      // Ambient sounds
      case 'birds_day':
        length = 132300 // 3s
        frequencies = [800, 950, 1100, 1300]
        envelope = (t) => {
          const birdCall = Math.sin(2 * Math.PI * frequencies[Math.floor(t * 2) % frequencies.length] * t)
          const background = 0.3 * Math.sin(2 * Math.PI * 200 * t) + 0.2 * Math.sin(2 * Math.PI * 300 * t)
          return (birdCall + background) * Math.exp(-0.5 * t) * (0.4 + 0.6 * Math.random())
        }
        break

      case 'insects_day':
        length = 132300 // 3s
        frequencies = [400, 600, 800]
        envelope = (t) => {
          const chirp = Math.sin(2 * Math.PI * frequencies[Math.floor(t * 8) % frequencies.length] * t)
          return chirp * Math.exp(-0.8 * t) * (0.2 + 0.3 * Math.random())
        }
        break

      case 'wind':
        length = 176400 // 4s
        frequencies = [50, 80, 120]
        envelope = (t) => {
          const gust = Math.sin(2 * Math.PI * frequencies[Math.floor(t * 0.5) % frequencies.length] * t)
          const turbulence = 0.5 * Math.sin(2 * Math.PI * 15 * t)
          return (gust + turbulence) * Math.exp(-0.3 * t) * (0.3 + 0.4 * Math.random())
        }
        break

      case 'crickets_night':
        length = 132300 // 3s
        frequencies = [300, 450, 600]
        envelope = (t) => {
          const chirp = Math.sin(2 * Math.PI * frequencies[Math.floor(t * 6) % frequencies.length] * t)
          const chorus = 0.4 * Math.sin(2 * Math.PI * 200 * t)
          return (chirp + chorus) * Math.exp(-0.6 * t) * (0.3 + 0.4 * Math.random())
        }
        break

      case 'owls_night':
        length = 22050 // 0.5s (occasional calls)
        frequencies = [150, 200, 250]
        envelope = (t) => {
          const hoot = Math.sin(2 * Math.PI * frequencies[Math.floor(t * 3) % frequencies.length] * t)
          return hoot * Math.exp(-4 * t) * (0.5 + 0.3 * Math.random())
        }
        break

      case 'rustling':
        length = 44100 // 1s
        frequencies = [100, 150, 200]
        envelope = (t) => {
          const rustle = Math.sin(2 * Math.PI * frequencies[Math.floor(t * 4) % frequencies.length] * t)
          const leaves = 0.6 * Math.sin(2 * Math.PI * 50 * t)
          return (rustle + leaves) * Math.exp(-1.5 * t) * (0.4 + 0.3 * Math.random())
        }
        break

      case 'rainfall':
        length = 132300 // 3s
        frequencies = [200, 300, 400]
        envelope = (t) => {
          const drops = Math.sin(2 * Math.PI * frequencies[Math.floor(t * 12) % frequencies.length] * t)
          const patter = 0.5 * Math.sin(2 * Math.PI * 80 * t)
          return (drops + patter) * Math.exp(-0.4 * t) * (0.5 + 0.3 * Math.random())
        }
        break

      case 'thunder':
        length = 88200 // 2s
        frequencies = [50, 80, 120]
        envelope = (t) => {
          const rumble = Math.sin(2 * Math.PI * frequencies[Math.floor(t * 2) % frequencies.length] * t)
          const crack = 0.8 * Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-20 * t)
          return (rumble + crack) * Math.exp(-0.8 * t)
        }
        break

      case 'dripping':
        length = 88200 // 2s
        frequencies = [150, 200, 250]
        envelope = (t) => {
          const drop = Math.sin(2 * Math.PI * frequencies[Math.floor(t * 3) % frequencies.length] * t)
          return drop * Math.exp(-8 * t) * (0.6 + 0.2 * Math.random())
        }
        break

      // Default sounds (existing)
      default:
        length = 4410 // 0.1s
        frequencies = [name === 'success' ? 880 : name === 'scan' ? 440 : name === 'focus' ? 660 : 550]
        envelope = (t) => Math.exp(-20 * t)
    }

    const arr = new Float32Array(length)

    for (let i = 0; i < length; i++) {
      const t = i / 44100

      if (name.startsWith('birds_') || name.startsWith('insects_') ||
          name.startsWith('crickets_') || name.startsWith('owls_') ||
          name.startsWith('wind') || name.startsWith('rustling') ||
          name.startsWith('rainfall') || name.startsWith('thunder') ||
          name.startsWith('dripping')) {
        // Use the specialized envelope for ambient sounds
        arr[i] = envelope(t, i)
      } else if (name === 'discovery_chime' || name === 'sonar_ping' || name === 'success_flourish') {
        // Multi-frequency sounds
        let sample = 0
        for (let j = 0; j < frequencies.length; j++) {
          const phase = 2 * Math.PI * frequencies[j] * t
          const freqEnv = envelope(t, i)
          sample += Math.sin(phase) * freqEnv / frequencies.length
        }
        arr[i] = sample
      } else {
        // Simple single-frequency sounds
        const freq = frequencies[0]
        const t = i / 44100
        const env = envelope(t, i)
        arr[i] = Math.sin(2 * Math.PI * freq * t) * env
      }
    }

    return arr
  }
}

const sfx = new SfxManager()
export default sfx
