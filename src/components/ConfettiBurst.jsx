import { useEffect, useRef } from 'react'

export default function ConfettiBurst({ trigger }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!trigger || !ref.current) return
    const el = ref.current
    el.classList.remove('show')
    // force reflow
    void el.offsetHeight
    el.classList.add('show')
    const t = setTimeout(() => el.classList.remove('show'), 800)
    return () => clearTimeout(t)
  }, [trigger])

  return (
    <div ref={ref} className="confetti-burst">
      {Array.from({ length: 30 }).map((_, i) => (
        <span key={i} className={`c c${i % 5}`} />
      ))}
    </div>
  )
}
