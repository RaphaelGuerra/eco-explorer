export const RARITY_WEIGHTS = { common: 10, uncommon: 5, rare: 1 }
export const RARE_PITY_STEP = 0.25
export const RARE_PITY_MAX = 2.0
export const RADIANT_PITY_STEP = 0.01
export const RADIANT_PITY_MAX = 0.15

export function createSeededRng(seed = 1) {
  let t = Number(seed)
  if (!Number.isFinite(t)) t = 1
  let a = t >>> 0
  return function rng() {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let r = Math.imul(a ^ (a >>> 15), 1 | a)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function pickIndex(length, rng) {
  if (length <= 0) return -1
  return Math.min(length - 1, Math.floor(rng() * length))
}

export function selectByRarity(speciesPool, rareMultiplier = 1, chainBonus = null, rng = Math.random) {
  if (!Array.isArray(speciesPool) || speciesPool.length === 0) return null

  const adjustedPool = speciesPool.map(species => {
    let bonus = 1
    if (chainBonus && chainBonus.speciesId === species.id) {
      bonus = chainBonus.multiplier
    }
    const baseWeight = RARITY_WEIGHTS[species.rarity] || 1
    const rareWeight = species.rarity === 'rare' ? rareMultiplier : 1
    return { ...species, selectionWeight: baseWeight * rareWeight * bonus }
  })

  const totalWeight = adjustedPool.reduce((sum, s) => sum + s.selectionWeight, 0)
  if (totalWeight <= 0) return adjustedPool[adjustedPool.length - 1]
  let random = rng() * totalWeight

  for (const species of adjustedPool) {
    if (random < species.selectionWeight) return species
    random -= species.selectionWeight
  }
  return adjustedPool[adjustedPool.length - 1]
}

export function getDiscoveryChainBonus(recentDiscoveries, allSpecies, rng = Math.random) {
  if (!Array.isArray(recentDiscoveries) || recentDiscoveries.length === 0) return null

  const latestDiscovery = recentDiscoveries[recentDiscoveries.length - 1]
  const discoveredSpecies = (allSpecies || []).find(s => s.id === latestDiscovery)

  if (!discoveredSpecies || !discoveredSpecies.relationships) return null

  if (discoveredSpecies.relationships.prey_of) {
    const predators = discoveredSpecies.relationships.prey_of
    const idx = pickIndex(predators.length, rng)
    if (idx >= 0) {
      return {
        speciesId: predators[idx],
        multiplier: 2.5,
        hint: 'Fresh tracks suggest a predator is nearby...'
      }
    }
  }

  if (discoveredSpecies.relationships.pollination_trigger) {
    const flowerSpecies = (allSpecies || []).filter(s =>
      s.relationships && s.relationships.flower_dependent
    )
    const idx = pickIndex(flowerSpecies.length, rng)
    if (idx >= 0) {
      return {
        speciesId: flowerSpecies[idx].id,
        multiplier: 2.0,
        hint: 'These flowers attract certain pollinators...'
      }
    }
  }

  if (discoveredSpecies.relationships.social) {
    const socialSpecies = (allSpecies || []).filter(s =>
      s.relationships && s.relationships.social && s.id !== discoveredSpecies.id
    )
    const idx = pickIndex(socialSpecies.length, rng)
    if (idx >= 0) {
      return {
        speciesId: socialSpecies[idx].id,
        multiplier: 1.8,
        hint: 'Other social creatures may be nearby...'
      }
    }
  }

  return null
}

export function selectBehavior(species, gameTime, weather, rng = Math.random) {
  if (!species?.behaviors) return null

  const availableBehaviors = Object.entries(species.behaviors).filter(([, behaviorData]) => {
    if (behaviorData.time_restricted && gameTime === 'night') return false
    if (behaviorData.weather_restricted && behaviorData.weather_restricted !== weather) return false
    return true
  })

  if (availableBehaviors.length === 0) return null

  const weightedBehaviors = availableBehaviors.map(([behaviorKey, behaviorData]) => ({
    key: behaviorKey,
    data: behaviorData,
    weight: behaviorData.xp_bonus * 10
  }))

  const totalWeight = weightedBehaviors.reduce((sum, b) => sum + b.weight, 0)
  if (totalWeight <= 0) {
    return { key: availableBehaviors[0][0], ...availableBehaviors[0][1] }
  }
  let random = rng() * totalWeight

  for (const behavior of weightedBehaviors) {
    if (random < behavior.weight) {
      return { key: behavior.key, ...behavior.data }
    }
    random -= behavior.weight
  }

  return { key: availableBehaviors[0][0], ...availableBehaviors[0][1] }
}
