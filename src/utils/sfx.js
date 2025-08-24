import { Howl, Howler } from 'howler'

class EnhancedSoundManager {
  constructor() {
    this.sounds = new Map()
    this.ambientLayers = new Map()
    this.enabled = true
    this.volumes = {
      master: 0.7,
      ambient: 0.3,
      effects: 0.5,
      ui: 0.4
    }

    this.initializeSounds()
  }

  initializeSounds() {
    // Discovery sounds
    this.registerSound('discover_common', '/sounds/events/discovery_common.mp3', {
      volume: this.volumes.effects,
      category: 'discovery'
    })
    this.registerSound('discover_rare', '/sounds/events/discovery_rare.mp3', {
      volume: this.volumes.effects * 1.2,
      category: 'discovery'
    })
    this.registerSound('discover_radiant', '/sounds/events/discovery_radiant.mp3', {
      volume: this.volumes.effects * 1.5,
      category: 'discovery'
    })

    // UI feedback sounds
    this.registerSound('scan_start', '/sounds/feedback/scan_start.mp3', {
      volume: this.volumes.ui,
      category: 'ui'
    })
    this.registerSound('focus_found', '/sounds/feedback/focus_found.mp3', {
      volume: this.volumes.ui,
      category: 'ui'
    })
    this.registerSound('task_complete', '/sounds/feedback/task_complete.mp3', {
      volume: this.volumes.effects,
      category: 'achievement'
    })
  }

  registerSound(id, src, options = {}) {
    this.sounds.set(id, new Howl({
      src: [src],
      volume: options.volume || this.volumes.effects,
      ...options
    }))
  }

  registerAmbient(id, src, options = {}) {
    this.ambientLayers.set(id, new Howl({
      src: [src],
      loop: true,
      volume: 0, // Start at 0 for fade in
      ...options
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

  stopAmbient(ambientId, fadeTime = 2000) {
    const ambient = this.ambientLayers.get(ambientId)
    if (ambient) {
      ambient.fade(ambient.volume(), 0, fadeTime)
      setTimeout(() => ambient.stop(), fadeTime)
    }
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
    this.enabled = !this.enabled
    if (!this.enabled) {
      this.stopAll()
    }
    return this.enabled
  }
}

export default new EnhancedSoundManager()
