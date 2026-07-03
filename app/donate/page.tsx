'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function DonateContent() {
  const [amount, setAmount] = useState(5)
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  const handleDonate = async (donateAmount: number) => {
    setLoading(true)
    const res = await fetch('/api/donate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: donateAmount }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1a3a5c] flex items-center justify-center text-3xl mx-auto mb-4">❤️</div>
          <h1 className="text-2xl font-semibold text-white mb-2">Support Mountain House Assistant</h1>
          <p className="text-[#8899aa] text-sm">This tool is free for everyone in Mountain House. If it helped you, consider buying us a coffee!</p>
        </div>

        {/* Success / Cancel messages */}
        {success && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-4 text-center">
            <p className="text-green-400 font-medium">🎉 Thank you so much for your support!</p>
            <p className="text-green-300/70 text-sm mt-1">Your donation helps keep Mountain House Assistant free for everyone.</p>
          </div>
        )}
        {canceled && (
          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-2xl p-4 text-center">
            <p className="text-yellow-400 font-medium">No worries!</p>
            <p className="text-yellow-300/70 text-sm mt-1">Your donation was canceled. Feel free to try again anytime.</p>
          </div>
        )}

        {/* Preset amounts */}
        <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-[#8899aa] text-sm text-center">Choose an amount</p>
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 10].map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
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

          {/* Custom amount */}
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

          {/* Donate button */}
          <button
            onClick={() => handleDonate(custom ? parseInt(custom) : amount)}
            disabled={loading || (!amount && !custom)}
            className="w-full bg-[#1a3a5c] hover:bg-[#1e4d7a] disabled:opacity-30 text-white rounded-xl py-3 font-medium transition-all"
          >
            {loading ? 'Redirecting to checkout...' : `Donate $${custom || amount}`}
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-[#4a5568] text-xs">
          Payments are processed securely by Stripe. <br />
          Mountain House Assistant — Built with ❤️ by a local kid
        </p>

        {/* Back button */}
        <a href="/" className="text-center text-[#4a9eff] text-sm hover:underline">
          ← Back to Assistant
        </a>

      </div>
    </div>
  )
}

export default function DonatePage() {
  return (
    <Suspense>
      <DonateContent />
    </Suspense>
  )
}