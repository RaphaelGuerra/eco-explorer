import { describe, expect, it } from 'vitest'
import {
  createSeededRng,
  getDiscoveryChainBonus,
  selectBehavior,
  selectByRarity,
} from '../encounters'

describe('createSeededRng', () => {
  it('produces a deterministic sequence for the same seed', () => {
    const rngA = createSeededRng(42)
    const rngB = createSeededRng(42)
    const valuesA = [rngA(), rngA(), rngA()]
    const valuesB = [rngB(), rngB(), rngB()]
    expect(valuesA).toEqual(valuesB)
  })

  it('changes sequence with a different seed', () => {
    const rngA = createSeededRng(1)
    const rngB = createSeededRng(2)
    expect([rngA(), rngA()]).not.toEqual([rngB(), rngB()])
  })
})

describe('selectByRarity', () => {
  const pool = [
    { id: 'a', rarity: 'common' },
    { id: 'b', rarity: 'common' },
  ]

  it('uses chain bonus weight to tilt selection', () => {
    const rng = () => 0.4
    const noBonus = selectByRarity(pool, 1, null, rng)
    const withBonus = selectByRarity(pool, 1, { speciesId: 'b', multiplier: 3 }, rng)
    expect(noBonus?.id).toBe('a')
    expect(withBonus?.id).toBe('b')
  })

  it('returns null for empty pools', () => {
    expect(selectByRarity([], 1, null, () => 0.2)).toBeNull()
  })
})

describe('getDiscoveryChainBonus', () => {
  it('selects a predator using rng', () => {
    const recent = ['prey']
    const allSpecies = [
      { id: 'prey', relationships: { prey_of: ['pred1', 'pred2'] } },
    ]
    const rng = () => 0.9
    const bonus = getDiscoveryChainBonus(recent, allSpecies, rng)
    expect(bonus?.speciesId).toBe('pred2')
    expect(bonus?.multiplier).toBe(2.5)
  })
})

describe('selectBehavior', () => {
  it('selects a behavior by weight', () => {
    const species = {
      behaviors: {
        idle: { xp_bonus: 1 },
        hunt: { xp_bonus: 2 },
      },
    }
    const rng = () => 0.75
    const behavior = selectBehavior(species, 'day', 'clear', rng)
    expect(behavior?.key).toBe('hunt')
  })

  it('filters behaviors by time and weather', () => {
    const species = {
      behaviors: {
        dayOnly: { xp_bonus: 1, time_restricted: false },
        nightOnly: { xp_bonus: 1, time_restricted: true },
        rainyOnly: { xp_bonus: 1, weather_restricted: 'rainy' },
      },
    }
    const behavior = selectBehavior(species, 'night', 'clear', () => 0)
    expect(behavior?.key).toBe('dayOnly')
  })
})
