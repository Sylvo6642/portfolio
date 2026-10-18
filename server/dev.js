import { createServer } from 'node:http';
import analyze from '../api/analyze.js';
import chat from '../api/chat.js';

const port = Number(process.env.API_PORT || 3001);

const server = createServer(async (req, res) => {
  // Adapt the existing Vercel handler to Node's local HTTP server.
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
    return res;
  };

  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/api/health' && req.method === 'GET') {
    return res.json({ status: 'ok', services: {
      gemini: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
      supabase: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
    } });
  }
  const handler = { '/api/analyze': analyze, '/api/chat': chat }[pathname];
  if (!handler) return res.status(404).json({ error: 'Not found' });
  if (pathname === '/api/chat' && req.method === 'GET') return await chat(req, res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!req.headers['content-type']?.includes('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }

  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 1_048_576) return res.status(413).json({ error: 'Request body too large' });
      chunks.push(chunk);
    }
    try {
      req.body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    return await handler(req, res);
  } catch (error) {
    console.error('Local API request failed:', error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
    else res.end();
  }
});

server.listen(port, '127.0.0.1', () => console.log(`Backend ready at http://127.0.0.1:${port}`));
