export function createDefaultSmartHintState() {
  return {
    failedScans: 0,
    failedQuizzes: 0,
    lastActivity: Date.now(),
    hintLevel: 0,
    currentHint: null,
  }
}

const smartHints = {
  noEncounters: {
    threshold: 3,
    hints: [
      { level: 1, text: 'Try scanning at different times of day', urgent: false },
      { level: 2, text: 'Different weather conditions attract different species', urgent: false },
      {
        level: 3,
        text: 'Some species are very rare - try conservation tasks to improve your chances',
        urgent: true,
      },
    ],
  },
  struggling: {
    threshold: 2,
    hints: [
      { level: 1, text: 'Take your time to observe the species carefully', urgent: false },
      { level: 2, text: 'Check the Eco-Dex for patterns and best conditions', urgent: false },
      {
        level: 3,
        text: 'Each animal has unique traits - focus on what makes them special',
        urgent: true,
      },
    ],
  },
  inactive: {
    threshold: 60,
    hints: [
      { level: 1, text: 'New species are waiting to be discovered', urgent: false },
      { level: 2, text: 'Try completing a conservation task to help the ecosystem', urgent: false },
      { level: 3, text: 'Check your objectives for daily goals and rewards', urgent: true },
    ],
  },
  optimalTime: {
    hints: [
      { level: 1, text: 'This is a great time for sky species - look up!', urgent: false },
      { level: 2, text: 'Ground animals are most active now', urgent: false },
      { level: 3, text: 'Nocturnal species become more active at night', urgent: false },
    ],
  },
}

export function getSmartHint(hintState, gameTime, weather, recentDiscoveries) {
  const now = Date.now()
  const timeSinceActivity = (now - hintState.lastActivity) / 1000

  if (timeSinceActivity > smartHints.inactive.threshold) {
    const hint =
      smartHints.inactive.hints[
        Math.min(hintState.hintLevel, smartHints.inactive.hints.length - 1)
      ]
    return { ...hint, type: 'inactive' }
  }

  if (hintState.failedScans >= smartHints.noEncounters.threshold) {
    const hint =
      smartHints.noEncounters.hints[
        Math.min(hintState.hintLevel, smartHints.noEncounters.hints.length - 1)
      ]
    return { ...hint, type: 'noEncounters' }
  }

  if (hintState.failedQuizzes >= smartHints.struggling.threshold) {
    const hint =
      smartHints.struggling.hints[
        Math.min(hintState.hintLevel, smartHints.struggling.hints.length - 1)
      ]
    return { ...hint, type: 'struggling' }
  }

  if (recentDiscoveries.length === 0) {
    const timeHints = smartHints.optimalTime.hints
    let hintIndex = 0

    if (gameTime === 'night') hintIndex = 2
    else if (gameTime === 'day') hintIndex = 1

    if (weather === 'rainy' && hintIndex > 0) {
      hintIndex -= 1
    }

    const hint = timeHints[hintIndex]
    return { ...hint, type: 'optimalTime' }
  }

  return null
}

export function updateActivity(setSmartHintState, action) {
  setSmartHintState((prevState) => {
    const now = Date.now()
    const nextState = {
      ...prevState,
      lastActivity: now,
    }

    switch (action) {
      case 'scan':
        nextState.failedScans = 0
        break
      case 'success':
        nextState.failedQuizzes = 0
        nextState.hintLevel = Math.max(0, prevState.hintLevel - 1)
        break
      case 'failure':
        nextState.failedQuizzes = prevState.failedQuizzes + 1
        break
      case 'noEncounter':
        nextState.failedScans = prevState.failedScans + 1
        break
      default:
        break
    }

    return nextState
  })
}
