import { supabase } from './supabase';

// One message every five minutes per browser, shared by the contact form and the chat
export const COOLDOWN_MS = 5 * 60 * 1000;
const LS_KEY = 'contact_last_sent';

export function getCooldownRemaining(): number {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return 0;
    return Math.max(0, COOLDOWN_MS - (Date.now() - parseInt(raw, 10)));
  } catch {
    return 0;
  }
}

export type ContactMessage = { name: string; email: string; message: string };

/** Saves the message and emails it to me; true once it's stored */
export async function sendContactMessage({ name, email, message }: ContactMessage): Promise<boolean> {
  if (!supabase) return false;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

  const [{ error }] = await Promise.all([
    supabase.from('messages').insert([{ name, email, message }]),
    fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    }).catch(() => null),
  ]);
  if (error) return false;

  try { localStorage.setItem(LS_KEY, Date.now().toString()); } catch {}
  return true;
}
