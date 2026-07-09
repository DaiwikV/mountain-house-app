import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  const { name, service, phone, category, email } = await req.json()

  // Validate required fields
  if (!name || !service || !phone || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Read current data.json
  const dataPath = path.join(process.cwd(), 'data.json')
  const raw = fs.readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(raw)

  // Add new provider
  const newProvider = {
    name: name.trim(),
    service: service.trim(),
    phone: phone.trim(),
    category: category.trim(),
    email: email?.trim() || '',
    featured: false,
    verified: false,
    pending: true,
    submittedAt: new Date().toISOString()
  }

  data.providers.push(newProvider)

  // Save back to data.json
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

  return NextResponse.json({ success: true })
}