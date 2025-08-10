// Simple rule-based assistant brain for Eco-Explorer
// Returns a response with text and optional quick actions

/**
 * @typedef {Object} AssistantAction
 * @property {('startScan'|'openEcoLog'|'openPerks'|'switchLanguage')} type
 * @property {string=} value
 */

/**
 * @typedef {Object} AssistantResponse
 * @property {string} text
 * @property {AssistantAction[]} [actions]
 */

/**
 * Build a compact context snapshot for the assistant
 */
export function buildContextSnapshot(gameState) {
  const {
    playerState,
    ecoLog,
    isScanning,
    isFocusing,
    hotEncounterSpeciesId,
  } = gameState;

  const discoveredCount = Object.keys(ecoLog || {}).length;
  const masteredCount = Object.values(ecoLog || {}).filter((e) => e.researchLevel >= 2).length;

  return {
    time: playerState?.gameTime || 'day',
    weather: playerState?.weather || 'clear',
    unlockedPerks: playerState?.unlockedPerks || [],
    discoveredCount,
    masteredCount,
    isScanning: !!isScanning,
    isFocusing: !!isFocusing,
    hotEncounterSpeciesId: hotEncounterSpeciesId || null,
  };
}

/**
 * Rule-based policy to produce guidance and actions.
 * @param {ReturnType<typeof buildContextSnapshot>} ctx
 * @param {string} userText lowercased user message
 * @param {{supportedLanguages: string[], currentLanguage: string}} lang
 * @returns {AssistantResponse}
 */
export function getAssistantResponse(ctx, userText, lang) {
  // Language intent
  if (/\b(language|idioma|langue|idioma)\b/.test(userText)) {
    const next = nextLanguage(lang.currentLanguage, lang.supportedLanguages);
    return {
      text: `I can switch the language. Do you want ${next.toUpperCase()}?`,
      actions: [
        { type: 'switchLanguage', value: next },
      ],
    };
  }

  // Help intents
  if (/\b(perk|skills?)\b/.test(userText)) {
    return {
      text: 'Perks are earned by mastering species. Review your perks and aim to complete mastery for new bonuses.',
      actions: [
        { type: 'openPerks' },
        { type: 'openEcoLog' },
      ],
    };
  }

  if (/\b(log|dex|eco[- ]?log|species)\b/.test(userText)) {
    return {
      text: 'Your Eco-Log tracks discovered species. Explore different times or weather to find more.',
      actions: [
        { type: 'openEcoLog' },
        { type: 'startScan' },
      ],
    };
  }

  // Contextual nudges
  if (!ctx.isScanning && !ctx.isFocusing) {
    if (ctx.time === 'day') {
      return {
        text: 'Try scanning now. Night-time can reveal different species. You can also check your Eco-Log for clues.',
        actions: [
          { type: 'startScan' },
          { type: 'openEcoLog' },
        ],
      };
    }
    return {
      text: 'Conditions look promising. Start a scan or review perks to boost encounter chances.',
      actions: [
        { type: 'startScan' },
        { type: 'openPerks' },
      ],
    };
  }

  if (ctx.isFocusing) {
    return {
      text: 'Move your cursor to locate the hotspot. When you are close enough, an encounter will begin.',
      actions: [],
    };
  }

  return {
    text: 'Keep exploring! You can review the Eco-Log and perks anytime, or switch the interface language.',
    actions: [
      { type: 'openEcoLog' },
      { type: 'openPerks' },
    ],
  };
}

function nextLanguage(current, supported) {
  const idx = supported.indexOf(current);
  if (idx === -1) return supported[0] || 'en';
  const nextIdx = (idx + 1) % supported.length;
  return supported[nextIdx];
}
