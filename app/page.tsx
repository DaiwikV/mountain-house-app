'use client'
import { useState, useRef, useEffect } from 'react'

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

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    })
    const data = await res.json()
    setMessages([...newMessages, { role: 'assistant', content: data.reply, suggestions: data.suggestions }])
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* HEADER */}
      <header className="border-b border-[#1e2a3a] bg-[#0d1117] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center text-lg">🏘️</div>
          <div>
            <h1 className="text-white font-semibold text-sm leading-none">Mountain House</h1>
            <p className="text-[#4a9eff] text-xs mt-0.5">Community Assistant</p>
          </div>
          <button
            onClick={() => setPage('donate')}
            className="ml-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#8899aa] text-xs hover:text-white hover:bg-white/10 transition-all hidden sm:block"
          >
            Donate
          </button>
        </div>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setPage('chat')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${page === 'chat' ? 'bg-[#1a3a5c] text-[#4a9eff]' : 'text-[#8899aa] hover:text-white hover:bg-[#1a1f2e]'}`}
          >
            Chat
          </button>
          <button
            onClick={() => setPage('about')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${page === 'about' ? 'bg-[#1a3a5c] text-[#4a9eff]' : 'text-[#8899aa] hover:text-white hover:bg-[#1a1f2e]'}`}
          >
            About
          </button>
          <button
            onClick={() => setPage('donate')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${page === 'donate' ? 'bg-[#1a3a5c] text-[#4a9eff]' : 'text-[#8899aa] hover:text-white hover:bg-[#1a1f2e]'}`}
          >
            Donate
          </button>
        </nav>
      </header>

      {/* CHAT PAGE */}
      {page === 'chat' && (
        <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 pb-6">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#1a3a5c] flex items-center justify-center text-3xl">🏘️</div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Your Mountain House Neighbor</h2>
                <p className="text-[#8899aa] text-sm max-w-md">Ask me anything about local services, events, and community info in Mountain House, CA.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {[
                  'Who fixes AC in Mountain House?',
                  'When does school start?',
                  'Who can fix my fridge?',
                  'When is garbage collection?'
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 rounded-xl border border-[#1e2a3a] bg-[#0d1117] hover:border-[#1a3a5c] hover:bg-[#111827] text-[#8899aa] hover:text-white text-xs transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="flex-1 flex flex-col gap-4 py-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-[#1a3a5c] flex items-center justify-center text-sm flex-shrink-0 mt-1">🏘️</div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1a3a5c] text-white rounded-tr-sm'
                        : 'bg-[#0d1117] border border-[#1e2a3a] text-[#d1d9e6] rounded-tl-sm'
                    }`}>
                      {msg.content.split('\n').map((line, j) => (
                        <p key={j} className={line.startsWith('-') || line.startsWith('•') ? 'mt-2' : 'mt-1'}>
                          {line}
                        </p>
                      ))}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-[#1e2a3a] flex items-center justify-center text-sm flex-shrink-0 mt-1">👤</div>
                    )}
                  </div>
                  {msg.suggestions && (
                    <div className="flex flex-wrap gap-2 ml-10">
                      {msg.suggestions.map((s, j) => (
                        <button
                          key={j}
                          onClick={() => sendMessage(s)}
                          className="text-xs px-3 py-2 rounded-xl border border-[#1e2a3a] bg-[#0d1117] hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#8899aa] transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-[#1a3a5c] flex items-center justify-center text-sm flex-shrink-0 mt-1">🏘️</div>
                  <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4a9eff] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4a9eff] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4a9eff] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          <div className="sticky bottom-0 pt-4">
            <div className="flex gap-2 bg-[#0d1117] border border-[#1e2a3a] rounded-2xl p-2 focus-within:border-[#1a3a5c] transition-all">
              <input
                className="flex-1 bg-transparent text-white text-sm px-3 py-2 outline-none placeholder-[#4a5568]"
                placeholder="Ask about Mountain House..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="bg-[#1a3a5c] hover:bg-[#1e4d7a] disabled:opacity-30 text-white rounded-xl px-4 py-2 text-sm font-medium transition-all"
              >
                Send
              </button>
            </div>
            <p className="text-center text-[#4a5568] text-xs mt-2">Mountain House Community Assistant — Local info only</p>
          </div>
        </div>
      )}

      {/* ABOUT PAGE */}
      {page === 'about' && (
        <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
          <div className="flex flex-col gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1a3a5c] flex items-center justify-center text-3xl mx-auto mb-4">🏘️</div>
              <h2 className="text-2xl font-semibold text-white mb-2">About Mountain House Assistant</h2>
              <p className="text-[#8899aa] text-sm max-w-md mx-auto">Built by a neighbor, for the neighborhood.</p>
            </div>
            <div className="grid gap-4">
              <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-2xl p-6">
                <h3 className="text-white font-medium mb-2">👋 The Story</h3>
                <p className="text-[#8899aa] text-sm leading-relaxed">This started as a summer break project by a 15 year old who lives right here in Mountain House. Tired of neighbors not knowing who to call when something breaks, he built a simple way to find trusted local help — no googling, no scrolling through random results, just real people from the community.</p>
              </div>
              <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-2xl p-6">
                <h3 className="text-white font-medium mb-2">🏘️ What This Is</h3>
                <p className="text-[#8899aa] text-sm leading-relaxed">A neighborhood assistant built specifically for Mountain House. Ask it who fixes AC, when school starts, what's happening in the community — it only knows Mountain House stuff, because that's all that matters here.</p>
              </div>
              <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-2xl p-6">
                <h3 className="text-white font-medium mb-2">✅ Real People, Real Listings</h3>
                <p className="text-[#8899aa] text-sm leading-relaxed">Every provider listed here is personally verified and actually based in Mountain House. No random results from Tracy or Stockton — just your actual neighbors who do this for a living.</p>
              </div>
              <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-2xl p-6">
                <h3 className="text-white font-medium mb-2">💼 Want to Be Listed?</h3>
                <p className="text-[#8899aa] text-sm leading-relaxed mb-4">If you're a local service provider in Mountain House, apply to get added. We review all applications and add verified businesses for free.</p>
                
                  href="/apply"
                  className="inline-block bg-[#1a3a5c] hover:bg-[#1e4d7a] text-white text-sm px-4 py-2 rounded-xl transition-all"
                >
                  Apply to Be Listed →
                </a>
              </div>
            </div>
            <div className="text-center text-[#4a5568] text-xs">
              <p>Mountain House Community Assistant</p>
              <p className="mt-1">Serving Mountain House, CA 95391</p>
              <p className="mt-1">Made with care by a Mountain House kid, summer 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* DONATE PAGE */}
      {page === 'donate' && (
        <div className="flex-1 max-w-md w-full mx-auto px-4 py-12">
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1a3a5c] flex items-center justify-center text-3xl mx-auto mb-4">💙</div>
              <h2 className="text-2xl font-semibold text-white mb-2">Support Mountain House Assistant</h2>
              <p className="text-[#8899aa] text-sm">This tool is free for everyone in Mountain House. If it helped you, consider supporting it!</p>
            </div>
            <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-2xl p-6 flex flex-col gap-4">
              <p className="text-[#8899aa] text-sm text-center">Choose an amount</p>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 50].map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustom('') }}
                    className={`py-3 rounded-xl text-sm font-medium transition-all border ${
                      amount === a && !custom
                        ? 'bg-[#1a3a5c] border-[#4a9eff] text-white'
                        : 'border-[#1e2a3a] text-[#8899aa] hover:border-[#4a9eff] hover:text-white'
                    }`}
                  >
                    ${a}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded-xl px-4 py-2 focus-within:border-[#4a9eff] transition-all">
                <span className="text-[#8899aa]">$</span>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={custom}
                  onChange={e => { setCustom(e.target.value); setAmount(0) }}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-[#4a5568]"
                />
              </div>
              <button
                onClick={() => handleDonate(custom ? parseInt(custom) : amount)}
                disabled={donateLoading || (!amount && !custom)}
                className="w-full bg-[#1a3a5c] hover:bg-[#1e4d7a] disabled:opacity-30 text-white rounded-xl py-3 font-medium transition-all"
              >
                {donateLoading ? 'Redirecting...' : `Donate $${custom || amount}`}
              </button>
            </div>
            <p className="text-center text-[#4a5568] text-xs">
              Payments processed securely by Stripe.<br />
              Built with care by a Mountain House kid, summer 2026.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}