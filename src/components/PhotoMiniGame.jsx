import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function PhotoMiniGame({ species, onResult }) {
  const { tNested } = useTranslation()
  const [timeLeft, setTimeLeft] = useState(2000) // ms
  const [radius, setRadius] = useState(80)
  const [, setHit] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 2000 - elapsed)
      setTimeLeft(remaining)
      setRadius(80 - Math.min(70, (elapsed / 2000) * 70))
      if (remaining === 0) {
        clearInterval(timer)
        onResult(false)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [onResult])

  const handleClick = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width/2
    const y = e.clientY - rect.top - rect.height/2
    const dist = Math.sqrt(x*x + y*y)
    if (dist < radius + 10 && dist > radius - 10) {
      setHit(true)
      onResult(true)
    } else {
      onResult(false)
    }
  }

  const pct = Math.round((timeLeft / 2000) * 100)

  return (
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content" style={{ position: 'relative' }}>
        <div className="emoji">{species.emoji}</div>
        <h2>{tNested('minigame.photoTitle')}</h2>
        <p>{tNested('minigame.photoHint')}</p>
        <div
          ref={ref}
          onClick={handleClick}
          className="photo-arena"
          style={{ width: 260, height: 260, position: 'relative', margin: '10px auto', background: 'rgba(0,0,0,0.1)', borderRadius: 8 }}
        >
          <div
            className="photo-ring"
            style={{
              position: 'absolute',
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: radius * 2, height: radius * 2,
              border: '3px dashed #34d399', borderRadius: '50%'
            }}
          />
        </div>
        <p>{tNested('minigame.timeLeft')}: {pct}%</p>
      </div>
    </div>
  )
}
