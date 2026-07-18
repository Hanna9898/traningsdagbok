exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: 'AI är inte konfigurerad på servern ännu.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ogiltig JSON.' }) };
  }

  const { messages, system, max_tokens } = body;
  if (!Array.isArray(messages) || !messages.length || !system) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ogiltig förfrågan.' }) };
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: Math.min(max_tokens || 1024, 4096),
        system,
        messages,
      }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return {
        statusCode: r.status,
        headers,
        body: JSON.stringify({
          error: data.error?.message || `Anthropic svarade med HTTP ${r.status}`,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: data.content?.[0]?.text || '' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Serverfel' }),
    };
  }
};
