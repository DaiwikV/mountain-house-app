import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  // Verify it's from Vercel
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get unreviewed submissions
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('reviewed', false)

    if (error) throw error
    if (!submissions?.length) {
      return NextResponse.json({ message: 'No submissions to review' })
    }

    const dataPath = path.join(process.cwd(), 'data.json')
    const raw = fs.readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(raw)

    for (const submission of submissions) {
      // Use OpenRouter to review
      const reviewRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'Mountain House App',
        },
        body: JSON.stringify({
          model: 'google/gemini-flash-1.5',
          messages: [
            {
              role: 'user',
              content: `Review this business application for Mountain House, CA. Respond with ONLY "APPROVED" or "REJECTED" (nothing else).

Name: ${submission.name}
Service: ${submission.service}
Phone: ${submission.phone}
Category: ${submission.category}
Email: ${submission.email}

Criteria: Is it a legitimate local service business in Mountain House? Valid phone? Not spam?`,
            }
          ],
        }),
      })

      const reviewData = await reviewRes.json()
      const decision = reviewData.choices?.[0]?.message?.content?.trim().toUpperCase()

      if (decision === 'APPROVED') {
        // Add to data.json
        data.providers.push({
          name: submission.name,
          service: submission.service,
          phone: submission.phone,
          category: submission.category,
        })

        // Save
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
      }

      // Mark as reviewed
      await supabase
        .from('submissions')
        .update({ reviewed: true, approved: decision === 'APPROVED' })
        .eq('id', submission.id)
    }

    return NextResponse.json({ 
      message: `Reviewed ${submissions.length} submissions`,
      approved: submissions.filter((s) => data.providers.some((p) => p.name === s.name)).length
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Review failed' }, { status: 500 })
  }
}