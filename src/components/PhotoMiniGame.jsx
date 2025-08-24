import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function PhotoMiniGame({ species, onResult }) {
  const { tNested } = useTranslation()
  const [timeLeft, setTimeLeft] = useState(4000) // ms - increased to 4 seconds
  const [radius, setRadius] = useState(100) // larger starting radius
  const [hit, setHit] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 4000 - elapsed)
      setTimeLeft(remaining)
      // Slower shrinking - from 100 to 30 (70 pixel reduction over 4 seconds)
      setRadius(100 - Math.min(70, (elapsed / 4000) * 70))
      if (remaining === 0) {
        clearInterval(timer)
        onResult(hit)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [onResult, hit])

  const handleClick = (e) => {
    if (!ref.current || hit) return // Prevent multiple clicks

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width/2
    const y = e.clientY - rect.top - rect.height/2
    const dist = Math.sqrt(x*x + y*y)

    setClickCount(prev => prev + 1)

    // More generous hit detection - within the ring area
    if (dist <= radius) {
      setHit(true)
      onResult(true)
    } else if (clickCount >= 2) { // Allow 3 attempts before failing
      onResult(false)
    }
  }

  const pct = Math.round((timeLeft / 4000) * 100)

  return (
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content" style={{ position: 'relative' }}>
        <div className="emoji">{species.emoji}</div>
        <h2>{tNested('minigame.photoTitle')}</h2>
        <p>{tNested('minigame.photoHint')}</p>

        <div className="minigame-instructions">
          <p>📸 <strong>Take the perfect photo!</strong> Wait for the ring to shrink to the right size, then click when it perfectly frames the wildlife.</p>
          <p>⏰ <strong>Time remaining:</strong> {Math.ceil(timeLeft / 1000)} seconds</p>
          {clickCount > 0 && <p>🎯 <strong>Attempts:</strong> {clickCount}/3</p>}
          <p>💡 <strong>Tip:</strong> The ring shrinks slowly - click when it feels just right!</p>
        </div>

        <div
          ref={ref}
          onClick={handleClick}
          className={`photo-arena ${hit ? 'success' : ''}`}
          style={{
            width: 320,
            height: 320,
            position: 'relative',
            margin: '15px auto',
            background: hit ? 'rgba(52, 211, 153, 0.1)' : 'rgba(0,0,0,0.1)',
            borderRadius: 12,
            border: hit ? '3px solid #34d399' : '2px dashed rgba(52, 211, 153, 0.3)',
            cursor: hit ? 'default' : 'crosshair',
            transition: 'all 0.3s ease',
            overflow: 'hidden'
          }}
        >
          {/* Wildlife Image/Representation */}
          <div className="wildlife-target">
            <div
              className="wildlife-emoji"
              style={{
                fontSize: hit ? '8rem' : '6rem',
                transition: 'all 0.3s ease',
                filter: hit ? 'drop-shadow(0 0 20px rgba(52, 211, 153, 0.8))' : 'none'
              }}
            >
              {species.emoji}
            </div>
            {!hit && (
              <div className="wildlife-glow">
                <div className="glow-ring"></div>
              </div>
            )}
          </div>

          {!hit && (
            <div
              className="photo-ring"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: radius * 2,
                height: radius * 2,
                border: '4px solid #34d399',
                borderRadius: '50%',
                animation: 'ring-pulse 1.5s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(52, 211, 153, 0.3)',
                pointerEvents: 'none'
              }}
            />
          )}

          {hit && (
            <div className="success-message">
              <span className="success-icon">📸</span>
              <p>Perfect shot!</p>
              <div className="captured-species">
                <span className="captured-emoji">{species.emoji}</span>
                <span className="captured-name">{species.name}</span>
              </div>
            </div>
          )}

          <div className="arena-background">
            <div className="background-blur"></div>
            <div className="background-pattern"></div>
          </div>

          {/* Visual guide for the perfect moment */}
          {!hit && (
            <div className="perfect-timing-guide">
              <div className="guide-text">
                Click when the ring is the perfect size to frame {species.name}! 🎯
              </div>
            </div>
          )}
        </div>

        <div className="minigame-stats">
          <div className="time-bar">
            <div
              className="time-fill"
              style={{ width: `${pct}%` }}
            ></div>
          </div>
          <p className="time-text">Time: {Math.ceil(timeLeft / 1000)}s</p>
        </div>
      </div>
    </div>
  )
}
