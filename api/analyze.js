export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
const { prompt } = body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

   if (!response.ok) {
  const err = await response.json().catch(() => ({}));
  console.error('Anthropic error:', JSON.stringify(err));
  return res.status(response.status).json({ error: err?.error?.message || JSON.stringify(err) });
}

    const data = await response.json();
    return res.status(200).json({ result: data.content?.[0]?.text || '' });

  } catch (e) {
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}