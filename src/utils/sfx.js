import { Howl, Howler } from 'howler'

const BASE_URL = import.meta.env.BASE_URL || '/'
const withBase = (path) => `${BASE_URL}${path.replace(/^\//, '')}`

class EnhancedSoundManager {
  constructor() {
    this.sounds = new Map()
    this.ambientLayers = new Map()
    this.enabled = true
    this.assetsMissing = false
    this.onMissingAssets = null
    this.volumes = {
      master: 0.7,
      ambient: 0.3,
      effects: 0.5,
      ui: 0.4
    }

    this.initializeSounds()
  }

  setMissingAssetsHandler(handler) {
    this.onMissingAssets = typeof handler === 'function' ? handler : null
  }

  hasMissingAssets() {
    return this.assetsMissing
  }

  handleAssetError(id, src, error) {
    if (this.assetsMissing) return
    this.assetsMissing = true
    this.setEnabled(false)
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[SFX] Audio asset failed to load; disabling sound.', { id, src, error })
    }
    if (this.onMissingAssets) {
      this.onMissingAssets({ id, src, error })
    }
  }

  initializeSounds() {
    // Discovery sounds
    this.registerSound('discover_common', withBase('sounds/events/discovery_common.mp3'), {
      volume: this.volumes.effects,
      category: 'discovery'
    })
    this.registerSound('discover_rare', withBase('sounds/events/discovery_rare.mp3'), {
      volume: this.volumes.effects * 1.2,
      category: 'discovery'
    })
    this.registerSound('discover_radiant', withBase('sounds/events/discovery_radiant.mp3'), {
      volume: this.volumes.effects * 1.5,
      category: 'discovery'
    })

    // UI feedback sounds
    this.registerSound('scan_start', withBase('sounds/feedback/scan_start.mp3'), {
      volume: this.volumes.ui,
      category: 'ui'
    })
    this.registerSound('focus_found', withBase('sounds/feedback/focus_found.mp3'), {
      volume: this.volumes.ui,
      category: 'ui'
    })
    this.registerSound('task_complete', withBase('sounds/feedback/task_complete.mp3'), {
      volume: this.volumes.effects,
      category: 'achievement'
    })

    // Scan/encounter feedback (used in App.jsx)
    this.registerSound('scan', withBase('sounds/feedback/scan.mp3'), {
      volume: this.volumes.ui,
      category: 'ui'
    })
    this.registerSound('sonar_ping', withBase('sounds/feedback/sonar_ping.mp3'), {
      volume: this.volumes.ui,
      category: 'ui'
    })
    this.registerSound('scan_pulse', withBase('sounds/feedback/scan_pulse.mp3'), {
      volume: this.volumes.ui,
      category: 'ui'
    })
    this.registerSound('focus', withBase('sounds/feedback/focus.mp3'), {
      volume: this.volumes.ui,
      category: 'ui'
    })
    this.registerSound('discovery_chime', withBase('sounds/events/discovery_chime.mp3'), {
      volume: this.volumes.effects,
      category: 'discovery'
    })
    this.registerSound('success', withBase('sounds/events/success.mp3'), {
      volume: this.volumes.effects,
      category: 'achievement'
    })
    this.registerSound('success_flourish', withBase('sounds/events/success_flourish.mp3'), {
      volume: this.volumes.effects,
      category: 'achievement'
    })

    // Ambient layers
    this.registerAmbient('birds_day', withBase('sounds/ambient/birds_day.mp3'))
    this.registerAmbient('insects_day', withBase('sounds/ambient/insects_day.mp3'))
    this.registerAmbient('wind', withBase('sounds/ambient/wind.mp3'))
    this.registerAmbient('crickets_night', withBase('sounds/ambient/crickets_night.mp3'))
    this.registerAmbient('owls_night', withBase('sounds/ambient/owls_night.mp3'))
    this.registerAmbient('rustling', withBase('sounds/ambient/rustling.mp3'))
    this.registerAmbient('rainfall', withBase('sounds/ambient/rainfall.mp3'))
    this.registerAmbient('thunder', withBase('sounds/ambient/thunder.mp3'))
    this.registerAmbient('dripping', withBase('sounds/ambient/dripping.mp3'))
  }

  registerSound(id, src, options = {}) {
    const { volume, onloaderror, onplayerror, ...rest } = options
    const resolvedVolume = Number.isFinite(volume) ? volume : this.volumes.effects
    const handleLoadError = (...args) => {
      if (onloaderror) onloaderror(...args)
      this.handleAssetError(id, src, args[1])
    }
    const handlePlayError = (...args) => {
      if (onplayerror) onplayerror(...args)
      this.handleAssetError(id, src, args[1])
    }

    this.sounds.set(id, new Howl({
      src: [src],
      volume: resolvedVolume,
      onloaderror: handleLoadError,
      onplayerror: handlePlayError,
      ...rest
    }))
  }

  registerAmbient(id, src, options = {}) {
    const { onloaderror, onplayerror, ...rest } = options
    const handleLoadError = (...args) => {
      if (onloaderror) onloaderror(...args)
      this.handleAssetError(id, src, args[1])
    }
    const handlePlayError = (...args) => {
      if (onplayerror) onplayerror(...args)
      this.handleAssetError(id, src, args[1])
    }

    this.ambientLayers.set(id, new Howl({
      src: [src],
      loop: true,
      volume: 0, // Start at 0 for fade in
      onloaderror: handleLoadError,
      onplayerror: handlePlayError,
      ...rest
    }))
  }

  play(soundId, options = {}) {
    if (!this.enabled) return

    const sound = this.sounds.get(soundId)
    if (sound) {
      if (options.stopOthersInCategory && options.category) {
        this.stopCategory(options.category)
      }
      sound.play()
    }
  }

  startAmbient(ambientId, fadeTime = 2000) {
    if (!this.enabled) return

    const ambient = this.ambientLayers.get(ambientId)
    if (ambient) {
      ambient.play()
      ambient.fade(0, this.volumes.ambient, fadeTime)
    }
  }

  playAmbient(ambientId, fadeTime = 2000) {
    this.startAmbient(ambientId, fadeTime)
  }

  stopAmbient(ambientId, fadeTime = 2000) {
    const ambient = this.ambientLayers.get(ambientId)
    if (ambient) {
      ambient.fade(ambient.volume(), 0, fadeTime)
      setTimeout(() => ambient.stop(), fadeTime)
    }
  }

  stopAllAmbient() {
    this.ambientLayers.forEach((_, id) => this.stopAmbient(id))
  }

  crossfadeAmbient(fromId, toId, duration = 3000) {
    this.stopAmbient(fromId, duration)
    this.startAmbient(toId, duration)
  }

  stopCategory(category) {
    // Stop all sounds in a specific category
    this.sounds.forEach((sound, id) => {
      // Find sounds that belong to this category
      // Note: In a real implementation, you'd want to store category metadata with each sound
      if (id.includes(category) || (category === 'discovery' && id.includes('discover'))) {
        sound.stop()
      }
    })
  }

  setVolume(category, volume) {
    this.volumes[category] = Math.max(0, Math.min(1, volume))

    if (category === 'master') {
      Howler.volume(this.volumes.master)
    } else if (category === 'ambient') {
      this.ambientLayers.forEach(sound => {
        sound.volume(this.volumes.ambient)
      })
    }
  }

  stopAll() {
    this.sounds.forEach(sound => sound.stop())
    this.ambientLayers.forEach(sound => sound.stop())
  }

  toggle() {
    if (this.assetsMissing) {
      this.enabled = false
      this.stopAll()
      return this.enabled
    }

    this.enabled = !this.enabled
    if (!this.enabled) {
      this.stopAll()
    }
    return this.enabled
  }

  setEnabled(enabled) {
    const nextEnabled = Boolean(enabled)
    if (nextEnabled && this.assetsMissing) {
      this.enabled = false
      return
    }

    this.enabled = nextEnabled
    if (!this.enabled) {
      this.stopAll()
    }
  }

  preload(soundIds = [], ambientIds = []) {
    soundIds.forEach((id) => {
      const sound = this.sounds.get(id)
      if (sound) sound.load()
    })
    ambientIds.forEach((id) => {
      const ambient = this.ambientLayers.get(id)
      if (ambient) ambient.load()
    })
  }
}

export default new EnhancedSoundManager()
