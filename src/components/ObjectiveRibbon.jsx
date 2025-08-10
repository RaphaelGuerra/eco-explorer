import { useMemo } from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function ObjectiveRibbon({ ecoLog }) {
  const { tNested } = useTranslation()

  // Simple daily objective: log 2 sky species
  const progress = useMemo(() => {
    const count = Object.entries(ecoLog || {}).filter(([speciesId]) => (
      ['sagui', 'tucano_toco', 'beija_flor', 'mico_leao_dourado'].includes(speciesId)
    )).length
    const target = 2
    return { current: Math.min(count, target), target }
  }, [ecoLog])

  const pct = Math.round((progress.current / progress.target) * 100)

  return (
    <div className="objective-ribbon" style={{ marginTop: '0.5rem' }}>
      <div className="objective-title">{tNested('objective.logSky')}</div>
      <div className="objective-bar">
        <div className="objective-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="objective-count">{progress.current} / {progress.target}</div>
    </div>
  )
}
