export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { city, country } = req.body

  if (!city || !country) {
    return res.status(400).json({ error: 'city and country are required' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set' })
  }

  const prompt = `You are a geopolitical safety analyst. Analyze the current war and conflict safety situation for ${city}, ${country}. Focus on world war risk, military conflicts, geopolitical tensions, alliances, and regional instability.

Return ONLY a raw JSON object. No markdown, no backticks, no explanation. Start with { and end with }:
{
  "overall_score": <integer 0-100, where 100 = completely safe>,
  "travel_advisory": "<Safe to travel | Exercise caution | Avoid non-essential travel | Do not travel>",
  "factors": [
    {"name": "Active conflict proximity", "score": <0-100>, "icon": "⚔️"},
    {"name": "Alliance & NATO stability", "score": <0-100>, "icon": "🛡️"},
    {"name": "Nuclear & WMD threat level", "score": <0-100>, "icon": "☢️"},
    {"name": "Regional geopolitical tension", "score": <0-100>, "icon": "🌐"},
    {"name": "Economic warfare & sanctions", "score": <0-100>, "icon": "📉"},
    {"name": "Civil unrest & internal stability", "score": <0-100>, "icon": "🏛️"}
  ],
  "risk_flags": ["<max 5 short active risk indicators>"],
  "advisory": "<2-3 sentence factual geopolitical safety summary for ${city}, ${country}>"
}`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a geopolitical safety analyst. Always respond with raw JSON only. No markdown, no backticks, no explanation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1024
      })
    })

    const data = await response.json()
    console.log('Groq status:', response.status)
    console.log('Groq response:', JSON.stringify(data))

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Groq API error', details: data })
    }

    const text = data.choices?.[0]?.message?.content ?? ''
    const clean = text.replace(/```json|```/g, '').trim()

    return res.status(200).json({ result: clean })

  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message })
  }
}
