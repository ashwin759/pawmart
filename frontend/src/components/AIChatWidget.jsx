import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: "🐾 Hi there! I'm your AI Pet Advisor. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEnd = useRef(null)
  const { authFetch } = useAuth()

  const quickSuggestions = [
    "Best dog for apartments?",
    "What should I feed a Labrador puppy?",
    "Looking for low maintenance pets"
  ]

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [messages, open])

  const sendMessage = async (overrideText) => {
    const text = typeof overrideText === 'string' ? overrideText : input.trim()
    if (!text || loading) return
    
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)

    try {
      const res = await authFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || "I'm not sure about that." }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't connect to my brain. Please try again!" }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <button 
        className="chat-fab" 
        onClick={() => setOpen(v => !v)} 
        id="ai-chat-toggle" 
        title="AI Pet Advisor"
        style={{ transform: open ? 'scale(0) opacity(0)' : 'scale(1)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        🤖
      </button>

      {open && (
        <div className="chat-window slide-up" id="ai-chat-window" style={{ display: 'flex' }}>
          <div className="chat-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🤖 AI Pet Advisor</h3>
            <button onClick={() => setOpen(false)} style={{ background: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>

          <div className="chat-messages" style={{ flex: 1, padding: '20px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg fade-in ${msg.role}`} style={{ 
                marginBottom: '16px', 
                maxWidth: '90%', 
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : 'var(--radius-lg)',
                borderBottomLeftRadius: msg.role === 'ai' ? '4px' : 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {msg.text.split('\n').map((line, j) => (
                  <span key={j} style={{ display: 'block', marginBottom: j < msg.text.split('\n').length - 1 ? '8px' : '0' }}>
                    {line}
                  </span>
                ))}
              </div>
            ))}
            
            {loading && (
              <div className="chat-msg ai fade-in" style={{ alignSelf: 'flex-start', background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-lg)', borderBottomLeftRadius: '4px' }}>
                <div className="typing-indicator" style={{ background: 'transparent', padding: 0 }}>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            
            {!loading && messages.length === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Suggested questions:</p>
                {quickSuggestions.map((suggestion, idx) => (
                  <button 
                    key={idx} 
                    className="btn btn-secondary btn-sm fade-in" 
                    onClick={() => sendMessage(suggestion)}
                    style={{ textAlign: 'left', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-full)' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEnd} style={{ float: 'left', clear: 'both' }} />
          </div>

          <div className="chat-input-area" style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="input"
                style={{ flex: 1 }}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about breeds, diets, care..."
                disabled={loading}
                id="ai-chat-input"
                autoComplete="off"
              />
              <button 
                className="btn btn-primary" 
                onClick={() => sendMessage(input)} 
                disabled={loading || !input.trim()}
                style={{ width: '48px', height: '48px', padding: 0, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
