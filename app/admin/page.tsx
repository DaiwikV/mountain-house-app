'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Submission = {
  id: number
  name: string
  service: string
  phone: string
  category: string
  email: string
  reviewed: boolean
  approved: boolean
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      window.location.href = '/admin/login'
      return
    }

    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setSubmissions(data || [])
    setLoading(false)
  }

  const handleApprove = async (id: number) => {
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      loadSubmissions()
    }
  }

  const handleReject = async (id: number) => {
    await supabase
      .from('submissions')
      .update({ reviewed: true, approved: false })
      .eq('id', id)

    loadSubmissions()
  }

  const pendingCount = submissions.filter(s => !s.reviewed).length

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-[#1e2a3a] bg-[#0d1117] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
          <p className="text-[#8899aa] text-xs mt-1">{pendingCount} pending submissions</p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('admin_token')
            window.location.href = '/admin/login'
          }}
          className="text-[#8899aa] text-sm hover:text-white transition-all"
        >
          Logout
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">

        {loading ? (
          <p className="text-center text-[#8899aa]">Loading...</p>
        ) : submissions.length === 0 ? (
          <p className="text-center text-[#8899aa]">No submissions yet</p>
        ) : (
          <div className="grid gap-4">
            {submissions.map(sub => (
              <div
                key={sub.id}
                className={`border rounded-2xl p-6 ${
                  sub.reviewed
                    ? sub.approved
                      ? 'border-green-900/50 bg-green-900/10'
                      : 'border-red-900/50 bg-red-900/10'
                    : 'border-[#1e2a3a] bg-[#0d1117]'
                }`}
              >
                <div className="grid gap-4">
                  <div>
                    <p className="text-white font-medium">{sub.name}</p>
                    <p className="text-[#8899aa] text-sm">{sub.service}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#4a5568]">Phone</p>
                      <p className="text-white">{sub.phone}</p>
                    </div>
                    <div>
                      <p className="text-[#4a5568]">Category</p>
                      <p className="text-white">{sub.category}</p>
                    </div>
                    <div>
                      <p className="text-[#4a5568]">Email</p>
                      <p className="text-white">{sub.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[#4a5568]">Status</p>
                      <p className={`text-sm font-medium ${
                        sub.reviewed
                          ? sub.approved ? 'text-green-400' : 'text-red-400'
                          : 'text-yellow-400'
                      }`}>
                        {sub.reviewed ? (sub.approved ? 'Approved' : 'Rejected') : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {!sub.reviewed && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(sub.id)}
                        className="flex-1 bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 text-green-400 rounded-xl py-2 text-sm font-medium transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(sub.id)}
                        className="flex-1 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 rounded-xl py-2 text-sm font-medium transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  )
}