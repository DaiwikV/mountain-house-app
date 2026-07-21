import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  console.log('Apply endpoint called')

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Supabase URL exists:', !!supabaseUrl)
  console.log('Supabase Key exists:', !!supabaseKey)

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, submission: data })
}