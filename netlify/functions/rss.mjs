const CORS = { 'Access-Control-Allow-Origin': '*' };

const json = (status, data) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET, OPTIONS' } });
  }

  const feedUrl = new URL(req.url).searchParams.get('url');
  if (!feedUrl) return json(400, { error: 'Missing url parameter' });

  let target;
  try {
    target = new URL(feedUrl);
  } catch {
    return json(400, { error: 'Invalid url parameter' });
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return json(400, { error: 'Only http(s) URLs are allowed' });
  }

  try {
    const res = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StockwiseBot/1.0)' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const text = await res.text();
    return new Response(text, {
      status: 200,
      headers: {
        ...CORS,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600'
      }
    });
  } catch (e) {
    return json(502, { error: e.message });
  }
};
