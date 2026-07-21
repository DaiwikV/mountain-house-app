'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    const data = await res.json()

    if (data.success) {
      localStorage.setItem('admin_token', password)
      router.push('/admin')
    } else {
      setError('Invalid password')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col gap-6">

        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1a3a5c] flex items-center justify-center text-3xl mx-auto mb-4">🔐</div>
          <h1 className="text-2xl font-semibold text-white mb-2">Admin Login</h1>
          <p className="text-[#8899aa] text-sm">Review and approve business submissions</p>
        </div>

        <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-2xl p-6 flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-white text-sm font-medium">Admin Password</label>
            <input
              type="password"
              className="bg-[#0a0a0f] border border-[#1e2a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4a9eff] transition-all placeholder-[#4a5568]"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading || !password}
            className="w-full bg-[#1a3a5c] hover:bg-[#1e4d7a] disabled:opacity-30 text-white rounded-xl py-3 font-medium transition-all"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>

        </div>

      </div>
    </div>
  )
}