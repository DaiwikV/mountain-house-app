import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { id } = await req.json()

  // Get the submission
  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (!submission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Add to data.json
  const dataPath = path.join(process.cwd(), 'data.json')
  const raw = fs.readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(raw)

  data.providers.push({
    name: submission.name,
    service: submission.service,
    phone: submission.phone,
    category: submission.category,
  })

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

  // Mark as reviewed and approved
  await supabase
    .from('submissions')
    .update({ reviewed: true, approved: true })
    .eq('id', id)

  return NextResponse.json({ success: true })
}