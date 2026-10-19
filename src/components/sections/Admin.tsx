import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { ConnectingDots } from '../layout/ConnectingDots';

type Visitor = {
  id: string;
  ip: string | null;
  country: string | null;
  city: string | null;
  user_agent: string | null;
  page: string | null;
  visited_at: string;
};

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

type ChatLog = {
  id: string;
  created_at: string;
  browser_id: string;
  status: 'pending' | 'ok' | 'error';
  question: string;
  answer: string | null;
  tools: string[];
  input_tokens: number | null;
  output_tokens: number | null;
  latency_ms: number | null;
  cost_usd: number | null;
  error: string | null;
};

function parseBrowser(ua: string | null): string {
  if (!ua) return '—';
  const u = ua.toLowerCase();

  let browser = 'Unknown';
  if (u.includes('edg/') || u.includes('edgios') || u.includes('edga/')) browser = 'Edge';
  else if (u.includes('opr/') || u.includes('opera')) browser = 'Opera';
  else if (u.includes('chrome') && !u.includes('chromium')) browser = 'Chrome';
  else if (u.includes('chromium')) browser = 'Chromium';
  else if (u.includes('firefox') || u.includes('fxios')) browser = 'Firefox';
  else if (u.includes('safari') && !u.includes('chrome')) browser = 'Safari';
  else if (u.includes('msie') || u.includes('trident')) browser = 'IE';

  let os = 'Unknown';

  const iosMatch = ua.match(/\(iPhone.*?CPU iPhone OS ([\d_]+)/i) || ua.match(/\(iPad.*?CPU OS ([\d_]+)/i);
  const androidMatch = ua.match(/Android ([\d.]+)/i);
  const windowsMatch = ua.match(/Windows NT ([\d.]+)/i);
  const macMatch = ua.match(/Mac OS X ([\d_]+)/i);

  if (iosMatch) {
    const ver = iosMatch[1].replace(/_/g, '.');
    os = u.includes('ipad') ? `iPadOS ${ver}` : `iOS ${ver}`;
  } else if (androidMatch) {
    os = `Android ${androidMatch[1]}`;
  } else if (windowsMatch) {
    const ntMap: Record<string, string> = { '10.0': 'Win 10/11', '6.3': 'Win 8.1', '6.2': 'Win 8', '6.1': 'Win 7' };
    os = ntMap[windowsMatch[1]] ?? `Windows NT ${windowsMatch[1]}`;
  } else if (macMatch) {
    os = `macOS ${macMatch[1].replace(/_/g, '.')}`;
  } else if (u.includes('linux')) {
    os = 'Linux';
  }

  return `${browser} · ${os}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-fg/10 bg-fg/[0.03] p-6">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">{label}</p>
      <p className="mt-2 text-4xl font-semibold">{value}</p>
    </div>
  );
}

export function Admin() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatLog[]>([]);
  const [tab, setTab] = useState<'visitors' | 'messages' | 'chats'>('visitors');
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // Restore session on mount
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setAuthed(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) { setError('Configure Supabase in .env.local to enable admin access.'); return; }
    setSigningIn(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'incorrect credentials');
        setPassword('');
      } else {
        await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      }
    } catch {
      setError('network error, try again');
    }
    setSigningIn(false);
  }

  async function handleSignOut() {
    await supabase?.auth.signOut();
  }

  useEffect(() => {
    if (!authed || !supabase) return;
    setLoading(true);
    Promise.all([
      supabase.from('visitor_logs').select('*').order('visited_at', { ascending: false }).limit(100),
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
      supabase.from('chat_logs').select('*').order('created_at', { ascending: false }).limit(200),
    ]).then(([v, m, c]) => {
      setVisitors((v.data as Visitor[]) ?? []);
      setMessages((m.data as Message[]) ?? []);
      setChats((c.data as ChatLog[]) ?? []);
      setLoading(false);
    });
  }, [authed]);

  const uniqueIPs = new Set(visitors.map(v => v.ip)).size;
  const uniqueCountries = new Set(visitors.map(v => v.country).filter(Boolean)).size;
  const chatSpend = chats.reduce((sum, c) => sum + Number(c.cost_usd ?? 0), 0);
  const chatVisitors = new Set(chats.map(c => c.browser_id)).size;

  if (!authed) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <ConnectingDots className="opacity-30" />
        <a href="/" className="absolute top-6 left-6 z-10 text-muted hover:text-fg transition-colors" aria-label="Back to home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </a>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-sm"
        >
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted mb-2">Admin</p>
          <h1 className="text-2xl font-semibold mb-8">Dashboard</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              autoFocus
              required
              className="w-full bg-transparent px-4 py-3 text-sm outline-none rounded-lg border border-fg/10 focus:border-accent placeholder:text-muted/60"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-transparent px-4 py-3 text-sm outline-none rounded-lg border border-fg/10 focus:border-accent placeholder:text-muted/60"
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-xs text-red-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <button
              type="submit"
              disabled={signingIn}
              className="w-full rounded-full bg-fg text-bg px-6 py-3 text-sm font-medium transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {signingIn ? 'Signing in…' : 'Enter'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-16 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <a href="/" className="text-muted hover:text-fg transition-colors" aria-label="Back to home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </a>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted mb-1">Admin</p>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="font-mono text-xs text-muted hover:text-fg transition-colors"
        >
          sign out
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-6 h-6 rounded-full border-2 border-fg/20 border-t-fg animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            <StatCard label="Total Visits" value={visitors.length} />
            <StatCard label="Unique IPs" value={uniqueIPs} />
            <StatCard label="Countries" value={uniqueCountries} />
            <StatCard label="Messages" value={messages.length} />
            <StatCard label="AI Chats" value={chats.length} />
          </div>

          <div className="flex gap-1 mb-6 border-b border-fg/10">
            {(['visitors', 'messages', 'chats'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 font-mono text-xs tracking-[0.1em] uppercase transition-colors relative ${tab === t ? 'text-fg' : 'text-muted hover:text-fg'}`}
              >
                {t}
                {tab === t && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[1px] bg-fg" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'visitors' && (
              <motion.div
                key="visitors"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted border-b border-fg/10">
                      <th className="text-left py-3 pr-6">IP</th>
                      <th className="text-left py-3 pr-6">Location</th>
                      <th className="text-left py-3 pr-6">Page</th>
                      <th className="text-left py-3 pr-6">Browser</th>
                      <th className="text-left py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map(v => (
                      <tr key={v.id} className="border-b border-fg/5 hover:bg-fg/[0.02] transition-colors">
                        <td className="py-3 pr-6 font-mono text-xs text-muted">{v.ip ?? '—'}</td>
                        <td className="py-3 pr-6">
                          {v.city && v.country ? `${v.city}, ${v.country}` : v.country ?? '—'}
                        </td>
                        <td className="py-3 pr-6 font-mono text-xs">{v.page ?? '/'}</td>
                        <td className="py-3 pr-6 text-xs text-muted whitespace-nowrap">{parseBrowser(v.user_agent)}</td>
                        <td className="py-3 text-xs text-muted whitespace-nowrap">{formatDate(v.visited_at)}</td>
                      </tr>
                    ))}
                    {visitors.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-muted font-mono text-xs">no visitors yet</td></tr>
                    )}
                  </tbody>
                </table>
              </motion.div>
            )}

            {tab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="space-y-4"
              >
                {messages.map(m => (
                  <div key={m.id} className="rounded-xl border border-fg/10 bg-fg/[0.02] p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <a href={`mailto:${m.email}`} className="font-mono text-xs text-muted hover:text-accent transition-colors">{m.email}</a>
                      </div>
                      <p className="font-mono text-xs text-muted whitespace-nowrap">{formatDate(m.created_at)}</p>
                    </div>
                    <p className="text-sm text-fg/80 leading-relaxed">{m.message}</p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="py-12 text-center text-muted font-mono text-xs">no messages yet</p>
                )}
              </motion.div>
            )}

            {tab === 'chats' && (
              <motion.div
                key="chats"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="space-y-4"
              >
                <p className="font-mono text-xs text-muted">
                  {chatVisitors} visitors · ${chatSpend.toFixed(4)} spent on the last {chats.length} questions
                </p>
                {chats.map(c => (
                  <div key={c.id} className="rounded-xl border border-fg/10 bg-fg/[0.02] p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <p className="font-medium">{c.question}</p>
                      <p className="font-mono text-xs text-muted whitespace-nowrap">{formatDate(c.created_at)}</p>
                    </div>
                    {c.answer && <p className="text-sm text-fg/80 leading-relaxed whitespace-pre-wrap">{c.answer}</p>}
                    {c.error && <p className="font-mono text-xs text-red-400">{c.error}</p>}
                    <p className="mt-3 font-mono text-[10px] text-muted">
                      {[
                        c.status,
                        c.tools.length ? c.tools.join(', ') : null,
                        c.input_tokens != null ? `${c.input_tokens} → ${c.output_tokens} tokens` : null,
                        c.latency_ms != null ? `${(c.latency_ms / 1000).toFixed(1)}s` : null,
                        c.cost_usd != null ? `$${Number(c.cost_usd).toFixed(5)}` : null,
                        `visitor ${c.browser_id.slice(0, 8)}`,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                ))}
                {chats.length === 0 && (
                  <p className="py-12 text-center text-muted font-mono text-xs">no chats yet</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
