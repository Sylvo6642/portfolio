// Kept free of the AI SDK so the chat home can check the quota before the SDK loads

export type Quota = { remaining: number; limit: number; resetAt: string | null; available?: boolean };

const ID_KEY = 'kr-chat-browser-id';

function uuid() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

let memoryId: string | null = null;

/** A random per-browser id for the per-visitor limit; the server also limits by IP */
export function browserId() {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    return (memoryId ??= uuid());
  }
}

export async function fetchQuota(): Promise<Quota | null> {
  try {
    const res = await fetch('/api/chat', { headers: { 'X-Browser-Id': browserId() } });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}
