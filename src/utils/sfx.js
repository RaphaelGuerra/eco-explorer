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

    // Scan/encounter feedback (used in App.jsx)
    this.registerSound('scan', '/sounds/feedback/scan.mp3', {
      volume: this.volumes.ui,
      category: 'ui'
    })
    this.registerSound('sonar_ping', '/sounds/feedback/sonar_ping.mp3', {
      volume: this.volumes.ui,
      category: 'ui'
    })
    this.registerSound('scan_pulse', '/sounds/feedback/scan_pulse.mp3', {
      volume: this.volumes.ui,
      category: 'ui'
    })
    this.registerSound('focus', '/sounds/feedback/focus.mp3', {
      volume: this.volumes.ui,
      category: 'ui'
    })
    this.registerSound('discovery_chime', '/sounds/events/discovery_chime.mp3', {
      volume: this.volumes.effects,
      category: 'discovery'
    })
    this.registerSound('success', '/sounds/events/success.mp3', {
      volume: this.volumes.effects,
      category: 'achievement'
    })
    this.registerSound('success_flourish', '/sounds/events/success_flourish.mp3', {
      volume: this.volumes.effects,
      category: 'achievement'
    })

    // Ambient layers
    this.registerAmbient('birds_day', '/sounds/ambient/birds_day.mp3')
    this.registerAmbient('insects_day', '/sounds/ambient/insects_day.mp3')
    this.registerAmbient('wind', '/sounds/ambient/wind.mp3')
    this.registerAmbient('crickets_night', '/sounds/ambient/crickets_night.mp3')
    this.registerAmbient('owls_night', '/sounds/ambient/owls_night.mp3')
    this.registerAmbient('rustling', '/sounds/ambient/rustling.mp3')
    this.registerAmbient('rainfall', '/sounds/ambient/rainfall.mp3')
    this.registerAmbient('thunder', '/sounds/ambient/thunder.mp3')
    this.registerAmbient('dripping', '/sounds/ambient/dripping.mp3')
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
    this.enabled = !this.enabled
    if (!this.enabled) {
      this.stopAll()
    }
    return this.enabled
  }
}

export default new EnhancedSoundManager()
