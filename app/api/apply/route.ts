import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { name, service, phone, category, email } = await req.json()

  if (!name || !service || !phone || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert([
      {
        name: name.trim(),
        service: service.trim(),
        phone: phone.trim(),
        category: category.trim(),
        email: email?.trim() || '',
      }
    ])
    .select()

  if (error) {
    console.log('Supabase error:', error)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }

  return NextResponse.json({ success: true, submission: data })
}