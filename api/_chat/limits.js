import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const LIMITS = {
  browser: 10, // per visitor (browser id), for good: the limit visitors see
  ip: 40, // per IP in any 24 hours: catches cleared storage without blocking a shared office network
  global: 300, // whole site in any 24 hours: a hard ceiling on spend
};

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const db = url && serviceKey ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null;

const SALT = process.env.CHAT_IP_SALT || serviceKey || 'local-dev';

/** IPs are only stored hashed */
export function hashIp(ip) {
  return createHash('sha256').update(`${SALT}:${ip}`).digest('hex').slice(0, 32);
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  return (req.headers['x-real-ip'] || first || req.socket?.remoteAddress || 'unknown').toString().trim();
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The browser id is client-made, so anything malformed falls back to the IP */
export function browserKey(req, ipHash) {
  const id = req.headers['x-browser-id'];
  return typeof id === 'string' && UUID.test(id) ? id.toLowerCase() : `ip:${ipHash}`;
}

// Local fallback when Supabase isn't configured: per-process memory, no logs
const memory = [];
const DAY = 24 * 60 * 60 * 1000;

function memoryQuota(browserId, ipHash) {
  const recent = memory.filter((r) => r.at > Date.now() - DAY);
  const ipRows = recent.filter((r) => r.ipHash === ipHash);
  return {
    browser: memory.filter((r) => r.browserId === browserId).length,
    ip: ipRows.length,
    global: recent.length,
    ip_oldest: ipRows[0]?.at ?? null,
    global_oldest: recent[0]?.at ?? null,
  };
}

const plusDay = (at) => (at ? new Date(new Date(at).getTime() + DAY).toISOString() : null);

function verdict({ browser, ip, global, ip_oldest, global_oldest }) {
  const left = { browser: LIMITS.browser - browser, global: LIMITS.global - global, ip: LIMITS.ip - ip };
  const remaining = Math.max(0, Math.min(left.browser, left.global, left.ip));
  const reason = left.browser <= 0 ? 'browser' : left.global <= 0 ? 'global' : left.ip <= 0 ? 'ip' : null;
  // Whichever limit runs out first decides whether the visitor can come back later:
  // a visitor's own 10 never come back, the daily IP and site-wide limits do
  const binding = reason ?? (remaining === left.browser ? 'browser' : remaining === left.global ? 'global' : 'ip');
  const resetAt = binding === 'ip' ? plusDay(ip_oldest) : binding === 'global' ? plusDay(global_oldest) : null;
  return { ok: !reason, reason, remaining, limit: LIMITS.browser, resetAt };
}

/** How many questions this visitor has left, without using one */
export async function getQuota(browserId, ipHash) {
  if (!db) return verdict(memoryQuota(browserId, ipHash));
  const { data, error } = await db.rpc('chat_quota', { p_browser_id: browserId, p_ip_hash: ipHash });
  if (error) throw error;
  return verdict(data);
}

/**
 * Atomically checks every limit and, if allowed, records the question as pending.
 * Returns the verdict plus the log id to complete later.
 */
export async function reserve(browserId, ipHash, question) {
  if (!db) {
    const v = verdict(memoryQuota(browserId, ipHash));
    if (!v.ok) return v;
    memory.push({ browserId, ipHash, at: Date.now() });
    return { ...v, remaining: v.remaining - 1, id: null };
  }
  const { data, error } = await db.rpc('chat_reserve', {
    p_browser_id: browserId,
    p_ip_hash: ipHash,
    p_question: question,
    p_browser_limit: LIMITS.browser,
    p_ip_limit: LIMITS.ip,
    p_global_limit: LIMITS.global,
  });
  if (error) throw error;
  const v = verdict(data);
  return data.id ? { ...v, ok: true, reason: null, id: data.id } : v;
}

/** Fills in the answer and usage; failed requests are marked 'error' so they don't count */
export async function complete(id, fields) {
  if (!db || !id) return;
  const { error } = await db.from('chat_logs').update(fields).eq('id', id);
  if (error) console.error('chat_logs update failed:', error.message);
}
