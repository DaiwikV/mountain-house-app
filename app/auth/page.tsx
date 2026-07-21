'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthPage() {
  const router = useRouter()
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setError('')

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setError('Check your email to confirm signup!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
      }
    } catch (err) {
      setError((err as Error).message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1a3a5c] flex items-center justify-center text-3xl mx-auto mb-4">🏘️</div>
          <h1 className="text-2xl font-semibold text-white mb-2">Mountain House Assistant</h1>
          <p className="text-[#8899aa] text-sm">{isSignup ? 'Create an account' : 'Sign in to your account'}</p>
        </div>

        {/* Form */}
        <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-2xl p-6 flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-white text-sm font-medium">Email</label>
            <input
              type="email"
              className="bg-[#0a0a0f] border border-[#1e2a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4a9eff] transition-all placeholder-[#4a5568]"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white text-sm font-medium">Password</label>
            <input
              type="password"
              className="bg-[#0a0a0f] border border-[#1e2a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4a9eff] transition-all placeholder-[#4a5568]"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className={`text-xs ${error.includes('Check your email') ? 'text-green-400' : 'text-red-400'}`}>
              {error}
            </p>
          )}

          <button
            onClick={handleAuth}
            disabled={loading || !email || !password}
            className="w-full bg-[#1a3a5c] hover:bg-[#1e4d7a] disabled:opacity-30 text-white rounded-xl py-3 font-medium transition-all"
          >
            {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Sign In'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1e2a3a]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#0d1117] text-[#4a5568]">or</span>
            </div>
          </div>

          <button
            onClick={() => setIsSignup(!isSignup)}
            className="w-full border border-[#1e2a3a] hover:border-[#4a9eff] text-[#8899aa] hover:text-white rounded-xl py-3 font-medium transition-all"
          >
            {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>

        </div>

        <p className="text-center text-[#4a5568] text-xs">
          Your chats are saved and private to your account
        </p>

      </div>
    </div>
  )
}