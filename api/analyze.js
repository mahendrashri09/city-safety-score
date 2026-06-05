export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { city, country } = req.body

  const prompt = `You are a geopolitical safety analyst. Analyze the current war and conflict safety situation for ${city}, ${country}. Focus on world war risk, military conflicts, geopolitical tensions, alliances, and regional instability.

Return ONLY valid JSON (no markdown) in this structure:
{
  "overall_score": <0-100>,
  "travel_advisory": "<Safe to travel | Exercise caution | Avoid non-essential travel | Do not travel>",
  "factors": [
    {"name": "Active conflict proximity", "score": <0-100>, "icon": "⚔️"},
    {"name": "Alliance & NATO stability", "score": <0-100>, "icon": "🛡️"},
    {"name": "Nuclear & WMD threat level", "score": <0-100>, "icon": "☢️"},
    {"name": "Regional geopolitical tension", "score": <0-100>, "icon": "🌐"},
    {"name": "Economic warfare & sanctions", "score": <0-100>, "icon": "📉"},
    {"name": "Civil unrest & internal stability", "score": <0-100>, "icon": "🏛️"}
  ],
  "risk_flags": ["<max 5 short flags>"],
  "advisory": "<2-3 sentence factual safety summary>"
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  const text = (data.content ?? []).map(b => b.text ?? '').join('')
  res.status(200).json({ result: text })
}
