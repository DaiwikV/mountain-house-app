'use client'
import { useState } from 'react'

export default function ApplyPage() {
  const [form, setForm] = useState({
    name: '',
    service: '',
    phone: '',
    category: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.name || !form.service || !form.phone || !form.category) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (data.success) {
      setSubmitted(true)
    } else {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center flex flex-col gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1a3a5c] flex items-center justify-center text-3xl mx-auto">✅</div>
          <h2 className="text-2xl font-semibold">Application Submitted!</h2>
          <p className="text-[#8899aa] text-sm">Thanks for applying to be listed on Mountain House Assistant. We'll review your info and add you shortly.</p>
          <a href="/" className="text-[#4a9eff] text-sm hover:underline">← Back to Assistant</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1a3a5c] flex items-center justify-center text-3xl mx-auto mb-4">💼</div>
          <h1 className="text-2xl font-semibold text-white mb-2">List Your Business</h1>
          <p className="text-[#8899aa] text-sm">Get listed on Mountain House Assistant and start receiving referrals from your neighbors.</p>
        </div>

        {/* Form */}
        <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-2xl p-6 flex flex-col gap-4">

          {/* Business Name */}
          <div className="flex flex-col gap-1">
            <label className="text-white text-sm font-medium">Business Name <span className="text-red-400">*</span></label>
            <input
              className="bg-[#0a0a0f] border border-[#1e2a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4a9eff] transition-all placeholder-[#4a5568]"
              placeholder="e.g. John's AC & Heating"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-white text-sm font-medium">Service Category <span className="text-red-400">*</span></label>
            <select
              className="bg-[#0a0a0f] border border-[#1e2a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4a9eff] transition-all"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select a category</option>
              <option value="ac">AC & Heating</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="appliance">Appliance Repair</option>
              <option value="garden">Gardening & Landscaping</option>
              <option value="handyman">Handyman</option>
              <option value="painting">Painting</option>
              <option value="roofing">Roofing</option>
              <option value="pest">Pest Control</option>
              <option value="cleaning">Cleaning</option>
              <option value="moving">Moving</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Service Description */}
          <div className="flex flex-col gap-1">
            <label className="text-white text-sm font-medium">What do you do? <span className="text-red-400">*</span></label>
            <textarea
              className="bg-[#0a0a0f] border border-[#1e2a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4a9eff] transition-all placeholder-[#4a5568] resize-none"
              placeholder="e.g. AC repair, heating installation, and maintenance for Mountain House residents."
              rows={3}
              value={form.service}
              onChange={e => setForm({ ...form, service: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label className="text-white text-sm font-medium">Phone Number <span className="text-red-400">*</span></label>
            <input
              className="bg-[#0a0a0f] border border-[#1e2a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4a9eff] transition-all placeholder-[#4a5568]"
              placeholder="e.g. (209) 555-0101"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-white text-sm font-medium">Email <span className="text-[#4a5568] text-xs">(optional)</span></label>
            <input
              className="bg-[#0a0a0f] border border-[#1e2a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4a9eff] transition-all placeholder-[#4a5568]"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#1a3a5c] hover:bg-[#1e4d7a] disabled:opacity-30 text-white rounded-xl py-3 font-medium transition-all"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>

          <p className="text-[#4a5568] text-xs text-center">We review all applications before adding them to the directory.</p>

        </div>

        <a href="/" className="text-center text-[#4a9eff] text-sm hover:underline">← Back to Assistant</a>

      </div>
    </div>
  )
}