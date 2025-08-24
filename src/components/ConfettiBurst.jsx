import { useEffect, useRef, useState } from 'react'
import './ConfettiBurst.css'

export default function ConfettiBurst({ trigger, intensity = 'normal' }) {
  const containerRef = useRef(null)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!trigger) return

    // Generate particles with random positions and properties
    const particleCount = intensity === 'high' ? 100 : 50
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: `particle-${Date.now()}-${i}`,
      x: Math.random() * 100, // percentage of viewport width
      y: -10, // start above viewport
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 0.3,
      color: ['#fde047', '#60a5fa', '#f472b6', '#34d399', '#f97316'][Math.floor(Math.random() * 5)]
    }))

    setParticles(newParticles)

    // Clear particles after animation
    const cleanup = setTimeout(() => {
      setParticles([])
    }, 4000)

    return () => clearTimeout(cleanup)
  }, [trigger, intensity])

  return (
    <div ref={containerRef} className="confetti-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="confetti-particle"
          style={{
            '--x': `${particle.x}vw`,
            '--y': `${particle.y}vh`,
            '--rotation': `${particle.rotation}deg`,
            '--scale': particle.scale,
            '--duration': `${particle.duration}s`,
            '--delay': `${particle.delay}s`,
            '--color': particle.color
          }}
        />
      ))}
    </div>
  )
}
