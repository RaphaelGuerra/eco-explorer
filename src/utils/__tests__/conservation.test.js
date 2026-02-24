import { describe, expect, it } from 'vitest'
import {
  buildConservationCompletionMessage,
  getAvailableConservationTasks,
  getConservationTokenReward,
  resolveConservationProgress,
} from '../conservation'

describe('conservation utils', () => {
  it('filters available tasks by weather/time and active list', () => {
    const tasks = getAvailableConservationTasks('night', 'rainy', [{ id: 'scan_sweep' }])
    const ids = tasks.map((task) => task.id)

    expect(ids).not.toContain('scan_sweep')
    expect(ids).toContain('night_watch')
    expect(ids).toContain('rain_tracker')
  })

  it('progresses matching tasks and returns completed tasks', () => {
    const activeTasks = [
      {
        id: 'quiz_notes',
        name: 'Field Notes',
        objective: { type: 'quiz', target: 1 },
        reward: { tokens: 6, message: 'Field notes verified! +6 field tokens' },
        progress: { current: 0, target: 1 },
      },
      {
        id: 'ground_trace',
        name: 'Ground Trace',
        objective: { type: 'log', target: 2, conditions: { habitat: 'ground' } },
        reward: { tokens: 7, message: 'Ground trace complete! +7 field tokens' },
        progress: { current: 1, target: 2 },
      },
    ]

    const result = resolveConservationProgress(activeTasks, ['quiz', 'log'], {
      habitat: 'ground',
      time: 'day',
      weather: 'clear',
    })

    expect(result.nextTasks.map((task) => task.id)).toEqual([])
    expect(result.completedTasks.map((task) => task.id)).toEqual(['quiz_notes', 'ground_trace'])
  })

  it('builds aggregate completion copy for multiple tasks', () => {
    const completed = [
      { name: 'Field Notes', reward: { tokens: 6 } },
      { name: 'Ground Trace', reward: { tokens: 7 } },
    ]

    expect(getConservationTokenReward(completed)).toBe(13)
    expect(buildConservationCompletionMessage(completed)).toBe(
      'Missions complete: Field Notes, Ground Trace. +13 field tokens',
    )
  })
})
