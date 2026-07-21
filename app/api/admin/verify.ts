import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  // Change this to your actual admin password
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mountain_house_admin_2026'

  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 401 })
}