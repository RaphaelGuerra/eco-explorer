import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { buildContextSnapshot, getAssistantResponse } from '../assistant/brain'

export default function AssistantPanel({ gameState, onAction }) {
  const { t, tNested, supportedLanguages, currentLanguage, setLanguage } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: t('assistant.welcome') }
  ])
  const endRef = useRef(null)

  const ctx = useMemo(() => buildContextSnapshot(gameState), [gameState])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')

    const resp = getAssistantResponse(ctx, text.toLowerCase(), { supportedLanguages, currentLanguage })
    setMessages(prev => [...prev, { role: 'assistant', text: resp.text }])

    if (resp.actions && resp.actions.length > 0) {
      // Expose actions as buttons
    }
  }

  const handleQuickAction = async (action) => {
    if (action.type === 'switchLanguage' && action.value) {
      await setLanguage(action.value)
      setMessages(prev => [...prev, { role: 'assistant', text: t('assistant.languageSwitched') }])
      return
    }
    onAction?.(action)
  }

  return (
    <div className={`assistant-panel ${isOpen ? 'open' : ''}`}>
      <button className="assistant-toggle" onClick={() => setIsOpen(!isOpen)} title={t('assistant.openTooltip')}>
        🤖
      </button>
      {isOpen && (
        <div className="assistant-body">
          <div className="assistant-header">{t('assistant.title')}</div>
          <div className="assistant-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>{m.text}</div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="assistant-actions">
            {(getAssistantResponse(ctx, '', { supportedLanguages, currentLanguage }).actions || []).map((a, i) => (
              <button key={i} className="action-btn" onClick={() => handleQuickAction(a)}>
                {tNested(`assistant.actions.${a.type}`)}
              </button>
            ))}
          </div>
          <div className="assistant-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('assistant.placeholder')}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
            />
            <button onClick={handleSend}>{t('assistant.send')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
