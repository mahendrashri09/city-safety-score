export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { city, country } = req.body

  if (!city || !country) {
    return res.status(400).json({ error: 'city and country are required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })
  }

  const prompt = `You are a geopolitical safety analyst. Analyze the current war and conflict safety situation for ${city}, ${country}. Focus on world war risk, military conflicts, geopolitical tensions, alliances, and regional instability.

Return ONLY valid JSON with no markdown, no backticks, no explanation. Just the raw JSON object:
{
  "overall_score": 75,
  "travel_advisory": "Exercise caution",
  "factors": [
    {"name": "Active conflict proximity", "score": 80, "icon": "⚔️"},
    {"name": "Alliance & NATO stability", "score": 70, "icon": "🛡️"},
    {"name": "Nuclear & WMD threat level", "score": 60, "icon": "☢️"},
    {"name": "Regional geopolitical tension", "score": 65, "icon": "🌐"},
    {"name": "Economic warfare & sanctions", "score": 75, "icon": "📉"},
    {"name": "Civil unrest & internal stability", "score": 70, "icon": "🏛️"}
  ],
  "risk_flags": ["Example flag 1", "Example flag 2"],
  "advisory": "2-3 sentence summary about the safety situation."
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()

    // Log full response for debugging
    console.log('Anthropic status:', response.status)
    console.log('Anthropic response:', JSON.stringify(data))

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Anthropic API error', details: data })
    }

    const text = (data.content ?? []).map(b => b.text ?? '').join('')
    return res.status(200).json({ result: text })

  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message })
  }
}
