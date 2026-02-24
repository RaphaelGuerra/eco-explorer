export const MAX_ACTIVE_MISSIONS = 3

export const conservationTasks = {
  scan_sweep: {
    id: 'scan_sweep',
    name: 'Scanner Sweep',
    description: 'Complete 3 scans.',
    icon: '📡',
    objective: { type: 'scan', target: 3 },
    reward: { tokens: 4, message: 'Scanner sweep complete! +4 field tokens' },
  },
  photo_proof: {
    id: 'photo_proof',
    name: 'Photo Proof',
    description: 'Land 1 successful photo capture.',
    icon: '📸',
    objective: { type: 'photo', target: 1 },
    reward: { tokens: 6, message: 'Photo evidence secured! +6 field tokens' },
  },
  quiz_notes: {
    id: 'quiz_notes',
    name: 'Field Notes',
    description: 'Answer 1 quiz correctly.',
    icon: '📝',
    objective: { type: 'quiz', target: 1 },
    reward: { tokens: 6, message: 'Field notes verified! +6 field tokens' },
  },
  sky_survey: {
    id: 'sky_survey',
    name: 'Canopy Survey',
    description: 'Log 2 sky species.',
    icon: '🦜',
    objective: { type: 'log', target: 2, conditions: { habitat: 'sky' } },
    reward: { tokens: 7, message: 'Canopy survey complete! +7 field tokens' },
  },
  ground_trace: {
    id: 'ground_trace',
    name: 'Ground Trace',
    description: 'Log 2 ground species.',
    icon: '🐾',
    objective: { type: 'log', target: 2, conditions: { habitat: 'ground' } },
    reward: { tokens: 7, message: 'Ground trace complete! +7 field tokens' },
  },
  night_watch: {
    id: 'night_watch',
    name: 'Night Watch',
    description: 'Log a species at night.',
    icon: '🌙',
    objective: { type: 'log', target: 1, conditions: { time: 'night' } },
    requirements: { time: ['night'] },
    reward: { tokens: 8, message: 'Night watch complete! +8 field tokens' },
  },
  rain_tracker: {
    id: 'rain_tracker',
    name: 'Rain Tracker',
    description: 'Log a species in rainy weather.',
    icon: '🌧️',
    objective: { type: 'log', target: 1, conditions: { weather: 'rainy' } },
    requirements: { weather: ['rainy'] },
    reward: { tokens: 8, message: 'Rain tracker complete! +8 field tokens' },
  },
}

export function getAvailableConservationTasks(gameTime, weather, activeTasks = []) {
  return Object.values(conservationTasks).filter((task) => {
    const isActive = activeTasks.some((entry) => entry.id === task.id)
    if (isActive) return false

    if (task.requirements?.time && !task.requirements.time.includes(gameTime)) return false
    if (task.requirements?.weather && !task.requirements.weather.includes(weather)) return false

    return true
  })
}

export function getTaskProgress(task) {
  const target = Math.max(1, task.objective?.target || 1)
  const current = Math.min(task.progress?.current || 0, target)
  const pct = Math.round((current / target) * 100)
  return { current, target, pct }
}

function matchesObjectiveConditions(objective, context = {}) {
  const conditions = objective?.conditions
  if (!conditions) return true
  if (conditions.habitat && conditions.habitat !== context.habitat) return false
  if (conditions.time && conditions.time !== context.time) return false
  if (conditions.weather && conditions.weather !== context.weather) return false
  return true
}

export function resolveConservationProgress(tasks = [], eventTypes, context = {}) {
  const types = Array.isArray(eventTypes)
    ? eventTypes.filter(Boolean)
    : [eventTypes].filter(Boolean)

  if (types.length === 0) {
    return { nextTasks: tasks, completedTasks: [] }
  }

  const completedTasks = []
  let changed = false

  const nextTasks = tasks.reduce((acc, task) => {
    if (!task?.objective || !types.includes(task.objective.type)) {
      acc.push(task)
      return acc
    }

    if (!matchesObjectiveConditions(task.objective, context)) {
      acc.push(task)
      return acc
    }

    const target = Math.max(1, task.objective.target || 1)
    const current = Math.min(task.progress?.current || 0, target)
    const nextCurrent = Math.min(target, current + 1)
    changed = true

    if (nextCurrent >= target) {
      completedTasks.push({ ...task, progress: { current: target, target } })
      return acc
    }

    acc.push({ ...task, progress: { current: nextCurrent, target } })
    return acc
  }, [])

  if (!changed) {
    return { nextTasks: tasks, completedTasks: [] }
  }

  return { nextTasks, completedTasks }
}

export function getConservationTokenReward(completedTasks = []) {
  return completedTasks.reduce((sum, task) => sum + (task.reward?.tokens || 0), 0)
}

export function buildConservationCompletionMessage(completedTasks = []) {
  if (!completedTasks.length) return null
  if (completedTasks.length === 1) return completedTasks[0].reward?.message || null

  const totalTokens = getConservationTokenReward(completedTasks)
  const names = completedTasks.map((task) => task.name).join(', ')
  return `Missions complete: ${names}. +${totalTokens} field tokens`
}
