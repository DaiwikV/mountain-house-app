import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Search the web for Mountain House specific info
async function searchMountainHouse(query: string) {
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: `${query} Mountain House CA`,
        num: 3,
      }),
    })
    const data = await res.json()
    const results = data.organic?.slice(0, 3).map((r: any) =>
      `${r.title}: ${r.snippet}`
    ).join('\n')
    return results || ''
  } catch (e) {
    return ''
  }
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  // Read from data.json
  const dataPath = path.join(process.cwd(), 'data.json')
  const raw = fs.readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(raw)

  // Build providers and announcements from data.json
  const providers = data.providers.map((p: any) =>
    `- ${p.name}: ${p.service}. Call ${p.phone}`
  ).join('\n')

  const announcements = data.announcements.map((a: any) =>
    `- ${a.title}: ${a.details}`
  ).join('\n')

  // Get the last user message
  const lastMessage = messages[messages.length - 1].content

  // Search the web for Mountain House specific info
  const searchResults = await searchMountainHouse(lastMessage)

  const systemPrompt = `You are a friendly neighborhood assistant for ${data.city}, ${data.state}. 
You talk like a helpful neighbor who knows everyone in town.
You ONLY help with topics related to Mountain House, CA.
You NEVER answer questions unrelated to Mountain House — politely redirect them.
When recommending a provider, mention their name, what they do, and phone number in a warm friendly way.
If web search results are provided, use them to answer but ONLY mention Mountain House relevant info.
If you find info from last year, give an estimate for this year and mention it's based on last year.
Always clarify if something is an estimate vs confirmed info.

Local Announcements:
${announcements}

Local Service Providers:
${providers}

Web Search Results for "${lastMessage} Mountain House CA":
${searchResults || 'No results found.'}`

  // Try Ollama first (only works locally)
  try {
    const ollamaRes = await fetch(`${process.env.OLLAMA_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (ollamaRes.ok) {
      const result = await ollamaRes.json()
      if (result?.choices?.[0]?.message?.content) {
        return NextResponse.json({ reply: result.choices[0].message.content, source: 'ollama' })
      }
    }
  } catch (e) {
    console.log('Ollama unavailable, falling back to OpenRouter')
  }

  // Fallback to OpenRouter
  try {
    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'Mountain House App',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    })

    const result = await openRouterRes.json()
    console.log('OpenRouter result:', JSON.stringify(result))

    if (result?.choices?.[0]?.message?.content) {
      return NextResponse.json({ reply: result.choices[0].message.content, source: 'openrouter' })
    }

    return NextResponse.json({ reply: 'Sorry, I could not get a response. Please try again!', source: 'error' })
  } catch (e) {
    console.log('OpenRouter error:', e)
    return NextResponse.json({ reply: 'Sorry, something went wrong. Please try again!', source: 'error' })
  }
}