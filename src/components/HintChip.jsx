import { useMemo } from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function HintChip({ gameTime, weather, pityRare, pityRadiant, lastEncounterMessage }) {
  const { tNested } = useTranslation()

  const hintKey = useMemo(() => {
    if (lastEncounterMessage) return 'hints.noBio'
    if (weather === 'rainy') return 'hints.tryRain'
    if (gameTime === 'night') return 'hints.tryNight'
    if ((pityRare || 0) + (pityRadiant || 0) >= 3) return 'hints.pityBuilding'
    return 'hints.tryClear'
  }, [gameTime, weather, pityRare, pityRadiant, lastEncounterMessage])

  return (
    <div className="hint-chip" style={{ marginBottom: '0.5rem', color: 'var(--light-text)' }}>
      {tNested(hintKey)}
    </div>
  )
}
