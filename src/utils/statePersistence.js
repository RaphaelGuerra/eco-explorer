const STORAGE_KEY = 'eco.v1.state'
const SCHEMA_VERSION = 1

export function loadEcoState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const version = Number(parsed.schemaVersion || 1)
    if (version !== SCHEMA_VERSION) return null
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
      playerState: parsed.playerState,
      ecoLog: parsed.ecoLog,
      recentDiscoveries: parsed.recentDiscoveries,
      conservationTokens: parsed.conservationTokens,
      achievementState: parsed.achievementState,
    }
  } catch {
    return null
  }
}

export function saveEcoState({ playerState, ecoLog, recentDiscoveries, conservationTokens, achievementState }) {
  try {
    const payload = {
      schemaVersion: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      playerState,
      ecoLog,
      recentDiscoveries,
      conservationTokens,
      achievementState,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore storage errors
  }
}

export function clearEcoState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}

export { STORAGE_KEY, SCHEMA_VERSION }
