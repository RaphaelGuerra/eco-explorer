import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function HintChip({ gameTime, weather, pityRare, pityRadiant, lastEncounterMessage, discoveryChain, smartHint }) {
  const { tNested } = useTranslation()
  const [hintIndex, setHintIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Environmental storytelling hints based on time and weather
  const environmentalHints = useMemo(() => {
    const hints = {
      dawn: [
        "Morning chorus begins as birds wake from their rest",
        "Fresh tracks visible in the morning dew",
        "Flowers open to greet the first rays of sunlight",
        "Nocturnal animals return to their dens"
      ],
      day: [
        "Insects buzz actively in the warm sunlight",
        "Birds soar high above, scanning for movement below",
        "Leaves rustle as small mammals forage for food",
        "Butterflies dance between flowering plants"
      ],
      dusk: [
        "Nocturnal creatures begin to stir in the fading light",
        "Bats prepare for their evening hunt",
        "Owls wake and sharpen their senses",
        "Fireflies begin their evening display"
      ],
      night: [
        "Stars emerge as night creatures take their places",
        "Mysterious sounds echo through the darkness",
        "Nocturnal flowers bloom under moonlight",
        "Predators hunt silently under the cover of night"
      ],
      clear: [
        "Perfect conditions for wildlife observation",
        "Animals are active in the pleasant weather",
        "Sounds carry clearly through the still air",
        "Good visibility for spotting distant movement"
      ],
      rainy: [
        "Fresh tracks appear in the soft, wet earth",
        "Some animals take shelter from the rain",
        "Water-loving species become more active",
        "The air is filled with the scent of wet earth"
      ]
    }

    // Combine time and weather hints
    const timeHints = hints[gameTime] || []
    const weatherHints = hints[weather] || []

    // Add special hints based on game state
    const specialHints = []

    // Smart hint takes highest priority
    if (smartHint) {
      return [smartHint.text];
    }

    // Discovery chain hint
    if (discoveryChain) {
      specialHints.push(discoveryChain.hint)
    }

    // Other game state hints
    if ((pityRare || 0) + (pityRadiant || 0) >= 3) {
      specialHints.push("Rare encounters seem more likely...")
    }
    if (lastEncounterMessage) {
      specialHints.push("Try scanning in different conditions")
    }

    return [...timeHints, ...weatherHints, ...specialHints]
  }, [gameTime, weather, pityRare, pityRadiant, lastEncounterMessage, discoveryChain, smartHint])

  // Rotate through hints every 8 seconds
  useEffect(() => {
    if (environmentalHints.length <= 1) return

    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setHintIndex(prev => (prev + 1) % environmentalHints.length)
        setIsVisible(true)
      }, 300)
    }, 8000)

    return () => clearInterval(interval)
  }, [environmentalHints.length])

  const currentHint = environmentalHints[hintIndex] || tNested('hints.tryClear')

  // Fallback to original logic if no environmental hints - keeping for potential future use
  // const fallbackHint = useMemo(() => {
  //   if (lastEncounterMessage) return 'hints.noBio'
  //   if (weather === 'rainy') return 'hints.tryRain'
  //   if (gameTime === 'night') return 'hints.tryNight'
  //   if ((pityRare || 0) + (pityRadiant || 0) >= 3) return 'hints.pityBuilding'
  //   return 'hints.tryClear'
  // }, [gameTime, weather, pityRare, pityRadiant, lastEncounterMessage])

  return (
    <div
      className={`hint-chip environmental-hint ${smartHint ? 'smart-hint' : ''} ${smartHint?.urgent ? 'urgent' : ''} ${isVisible ? 'visible' : 'fading'}`}
      style={{ marginBottom: '0.5rem', color: 'var(--light-text)' }}
    >
      {currentHint.startsWith('hints.') ? tNested(currentHint) : currentHint}
    </div>
  )
}
