import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  // Read from data.json
  const dataPath = path.join(process.cwd(), 'data.json')
  const raw = fs.readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(raw)

  // Build the system prompt from data.json
  const providers = data.providers.map((p: any) =>
    `- ${p.name}: ${p.service}. Call ${p.phone}`
  ).join('\n')

  const announcements = data.announcements.map((a: any) =>
    `- ${a.title}: ${a.details}`
  ).join('\n')

  const systemPrompt = `You are a friendly neighborhood assistant for ${data.city}, ${data.state}. 
You talk like a helpful neighbor who knows everyone in town.
You ONLY help with local services and community info for ${data.city}.
You ONLY talk about information that is explicitly listed below.
Do NOT make up events, providers, or any information that is not in this list.
If you don't have the answer in the data below, say "I don't have that info yet but check back soon!"
If someone asks about something unrelated to Mountain House, politely redirect them.
When recommending a provider, mention their name, what they do, and phone number in a warm friendly way.

Local Announcements:
${announcements}

Local Service Providers:
${providers}`

  // Try Ollama first (local)
  try {
    const ollamaRes = await fetch(`${process.env.OLLAMA_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    })

    if (ollamaRes.ok) {
      const result = await ollamaRes.json()
      return NextResponse.json({ reply: result.choices[0].message.content, source: 'ollama' })
    }
  } catch (e) {
    console.log('Ollama unavailable, falling back to OpenRouter')
  }

  // Fallback to OpenRouter
  const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Title': 'Mountain House App',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  })

  const result = await openRouterRes.json()
  return NextResponse.json({ reply: result.choices[0].message.content, source: 'openrouter' })
}