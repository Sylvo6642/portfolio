# Kevin Robin portfolio

Requires Node.js 20.19+.

```sh
npm ci
```

Run in two terminals:

```sh
npm run dev:backend
```

```sh
npm run dev
```

Open http://localhost:5173. The API listens on http://127.0.0.1:3001;
Vite proxies `/api` requests to it. `/api/health` reports readiness and whether
external services are configured. Project demos are served from `public/projects`.

Copy `.env.example` to `.env.local` and supply your own service credentials to enable
Supabase contact/admin features and Gemini analysis. Restart both servers after
changing environment variables. Without credentials, the portfolio still renders,
contact submission reports an error, and AI analysis returns a configuration message.
Visitor tracking is disabled during local development.

```sh
npm run build
```

Production API deployment continues to use Vercel's `api/analyze.js` handler.
Use `GEMINI_API_KEY` for the server key; the old `VITE_GEMINI_API_KEY` name is
accepted for compatibility with existing deployments.
