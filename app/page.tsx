'use client'
import { useState, useRef, useEffect } from 'react'

// Change this to match the "city" field in data.json
const CITY = 'Mountain House'

type Message = { role: 'user' | 'assistant'; content: string; suggestions?: string[] }

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState<'chat' | 'about' | 'donate'>('chat')
  const [amount, setAmount] = useState(10)
  const [custom, setCustom] = useState('')
  const [donateLoading, setDonateLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (overrideInput?: string) => {
    const text = overrideInput || input
    if (!text.trim()) return
    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.reply, suggestions: data.suggestions },
      ])
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    }
    setLoading(false)
  }

  const handleDonate = async (donateAmount: number) => {
    setDonateLoading(true)
    const res = await fetch('/api/donate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: donateAmount }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setDonateLoading(false)
  }

  const tab = (id: typeof page, label: string) => (
    <button
      onClick={() => setPage(id)}
      className="px-3 py-1.5 text-sm rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        fontFamily: 'Karla, system-ui, sans-serif',
        color: page === id ? 'var(--paper)' : 'var(--muted)',
        background: page === id ? 'var(--ink)' : 'transparent',
        outlineColor: 'var(--ink)',
      }}
    >
      {label}
    </button>
  )

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        // @ts-expect-error CSS custom properties
        '--paper': '#F8F5EE',
        '--card': '#FFFDF8',
        '--rule': '#E3DDD0',
        '--muted': '#8A8478',
        '--ink': '#2E4A7D',
        background: 'var(--paper)',
        color: 'var(--ink)',
        fontFamily: 'Karla, system-ui, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Karla:wght@400;500;700&display=swap');
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
        }
        .serif { font-family: Fraunces, Georgia, serif; font-optical-sizing: auto; }
      `}</style>

      {/* HEADER */}
      <header
        className="sticky top-0 z-50 px-5 sm:px-8 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'var(--paper)', borderBottom: '1px solid var(--rule)' }}
      >
        <div className="flex items-baseline gap-3 min-w-0">
          <h1 className="serif text-lg leading-none truncate" style={{ fontWeight: 600 }}>
            {CITY}
          </h1>
          <span
            className="text-xs uppercase"
            style={{ color: 'var(--muted)', letterSpacing: '0.08em' }}
          >
            Community Assistant
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {tab('chat', 'Chat')}
          {tab('about', 'About')}
          {tab('donate', 'Support')}
        </nav>
      </header>

      {/* CHAT */}
      {page === 'chat' && (
        <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-5 pb-6">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 gap-7">
              <div>
                <h2 className="serif text-4xl mb-3" style={{ fontWeight: 400 }}>
                  Ask the neighborhood.
                </h2>
                <p
                  className="text-sm max-w-sm mx-auto leading-relaxed"
                  style={{ color: 'var(--muted)' }}
                >
                  Local services, events, and community info for {CITY} — nothing else.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 w-full max-w-lg">
                {[
                  `Who fixes AC in ${CITY}?`,
                  'When does school start?',
                  'Who can fix my fridge?',
                  'When is garbage collection?',
                ].map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--rule)',
                      color: 'var(--muted)',
                      outlineColor: 'var(--ink)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--ink)'
                      e.currentTarget.style.borderColor = 'var(--ink)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--muted)'
                      e.currentTarget.style.borderColor = 'var(--rule)'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="flex-1 flex flex-col gap-5 py-8">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span
                    className="text-xs uppercase"
                    style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}
                  >
                    {msg.role === 'user' ? 'You' : CITY}
                  </span>
                  <div
                    className="rounded-xl px-4 py-3 max-w-[85%] text-[15px] leading-relaxed"
                    style={
                      msg.role === 'user'
                        ? { background: 'var(--ink)', color: 'var(--paper)' }
                        : { background: 'var(--card)', border: '1px solid var(--rule)' }
                    }
                  >
                    {msg.content.split('\n').map((line, j) => (
                      <p
                        key={j}
                        className={
                          line.trim().startsWith('-') || line.trim().startsWith('•')
                            ? 'mt-2'
                            : 'mt-1'
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>

                  {msg.suggestions && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.suggestions.map((s, j) => (
                        <button
                          key={j}
                          onClick={() => sendMessage(s)}
                          className="text-xs px-3 py-1.5 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{
                            border: '1px solid var(--rule)',
                            color: 'var(--muted)',
                            outlineColor: 'var(--ink)',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex flex-col gap-2 items-start">
                  <span
                    className="text-xs uppercase"
                    style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}
                  >
                    {CITY}
                  </span>
                  <div
                    className="rounded-xl px-4 py-3.5"
                    style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
                  >
                    <div className="flex gap-1.5 items-center">
                      {[0, 160, 320].map(d => (
                        <div
                          key={d}
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{
                            background: 'var(--ink)',
                            animationDelay: `${d}ms`,
                            opacity: 0.5,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          <div className="sticky bottom-0 pt-4" style={{ background: 'var(--paper)' }}>
            <div
              className="flex gap-2 items-center rounded-xl px-2 py-2"
              style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
            >
              <input
                className="flex-1 bg-transparent text-[15px] px-3 py-2 outline-none"
                style={{ color: 'var(--ink)' }}
                placeholder={`Ask about ${CITY}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: 'var(--ink)',
                  color: 'var(--paper)',
                  outlineColor: 'var(--ink)',
                }}
              >
                Send
              </button>
            </div>
            <p className="text-center text-xs mt-3" style={{ color: 'var(--muted)' }}>
              Local info only. Verify details with providers directly.
            </p>
          </div>
        </div>
      )}

      {/* ABOUT */}
      {page === 'about' && (
        <div className="flex-1 max-w-2xl w-full mx-auto px-5 py-14">
          <h2 className="serif text-4xl mb-10" style={{ fontWeight: 400 }}>
            Built by a neighbor.
          </h2>
          <div className="flex flex-col">
            {[
              {
                h: 'The story',
                p: `A summer project by a 15-year-old who lives here. Neighbors kept asking the same question — who do I call when something breaks? — so this answers it without the scroll through search results for towns that aren't ours.`,
              },
              {
                h: 'What it knows',
                p: `${CITY} and nothing else. Local services, school dates, community events. Ask it about anything further afield and it'll politely decline.`,
              },
              {
                h: 'Real listings',
                p: `Verified providers are actually based here. No filler results from three towns over dressed up as local.`,
              },
              {
                h: 'Get listed',
                p: `Run a service business here? Apply below. Listings are reviewed, and they're free.`,
              },
            ].map((s, i) => (
              <div
                key={s.h}
                className="py-7"
                style={{ borderTop: i === 0 ? 'none' : '1px solid var(--rule)' }}
              >
                <h3 className="serif text-xl mb-2" style={{ fontWeight: 600 }}>
                  {s.h}
                </h3>
                <p className="text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {s.p}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => { window.location.href = '/apply' }}
            className="inline-block mt-4 px-5 py-2.5 rounded-lg text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ background: 'var(--ink)', color: 'var(--paper)', outlineColor: 'var(--ink)' }}
          >
            Apply to be listed
          </button>
        </div>
      )}

      {/* SUPPORT */}
      {page === 'donate' && (
        <div className="flex-1 max-w-md w-full mx-auto px-5 py-14">
          <h2 className="serif text-4xl mb-3" style={{ fontWeight: 400 }}>
            Keep it free.
          </h2>
          <p className="text-[15px] leading-relaxed mb-8" style={{ color: 'var(--muted)' }}>
            This costs a few dollars a month to run. If it saved you a phone call, chip in.
          </p>

          <div
            className="rounded-xl p-6 flex flex-col gap-4"
            style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
          >
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 50].map(a => {
                const active = amount === a && !custom
                return (
                  <button
                    key={a}
                    onClick={() => {
                      setAmount(a)
                      setCustom('')
                    }}
                    className="py-3 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      background: active ? 'var(--ink)' : 'transparent',
                      color: active ? 'var(--paper)' : 'var(--muted)',
                      border: `1px solid ${active ? 'var(--ink)' : 'var(--rule)'}`,
                      outlineColor: 'var(--ink)',
                    }}
                  >
                    ${a}
                  </button>
                )
              })}
            </div>

            <div
              className="flex items-center gap-2 rounded-lg px-4 py-2.5"
              style={{ border: '1px solid var(--rule)' }}
            >
              <span style={{ color: 'var(--muted)' }}>$</span>
              <input
                type="number"
                placeholder="Other amount"
                value={custom}
                onChange={e => {
                  setCustom(e.target.value)
                  setAmount(0)
                }}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--ink)' }}
              />
            </div>

            <button
              onClick={() => handleDonate(custom ? parseInt(custom) : amount)}
              disabled={donateLoading || (!amount && !custom)}
              className="w-full rounded-lg py-3 text-sm font-medium transition-opacity disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: 'var(--ink)',
                color: 'var(--paper)',
                outlineColor: 'var(--ink)',
              }}
            >
              {donateLoading ? 'Opening checkout...' : `Give $${custom || amount}`}
            </button>
          </div>

          <p className="text-xs mt-5" style={{ color: 'var(--muted)' }}>
            Processed securely by Stripe.
          </p>
        </div>
      )}
    </div>
  )
}