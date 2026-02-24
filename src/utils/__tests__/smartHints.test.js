import { describe, expect, it, vi } from 'vitest'
import { createDefaultSmartHintState, getSmartHint, updateActivity } from '../smartHints'

describe('smart hint utilities', () => {
  it('returns inactivity hint when player has been idle', () => {
    const hintState = {
      ...createDefaultSmartHintState(),
      lastActivity: Date.now() - 70_000,
    }

    const hint = getSmartHint(hintState, 'day', 'clear', [])
    expect(hint?.type).toBe('inactive')
  })

  it('returns no-encounter hint when failed scans threshold is reached', () => {
    const hintState = {
      ...createDefaultSmartHintState(),
      failedScans: 3,
    }

    const hint = getSmartHint(hintState, 'day', 'clear', ['capivara'])
    expect(hint?.type).toBe('noEncounters')
  })

  it('updates activity counters for success and failure', () => {
    let state = {
      ...createDefaultSmartHintState(),
      failedQuizzes: 1,
      hintLevel: 2,
    }

    const setSmartHintState = vi.fn((updater) => {
      state = updater(state)
    })

    updateActivity(setSmartHintState, 'failure')
    expect(state.failedQuizzes).toBe(2)

    updateActivity(setSmartHintState, 'success')
    expect(state.failedQuizzes).toBe(0)
    expect(state.hintLevel).toBe(1)
  })
})
