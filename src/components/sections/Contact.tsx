import { motion, AnimatePresence } from 'framer-motion';
import { FadeText } from '../shared/FadeText';
import { useState, useEffect, type FormEvent, type ButtonHTMLAttributes } from 'react';
import { supabase } from '../../lib/supabase';

function useLocalTime() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const ist = new Date(time.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const h = ist.getHours();
  const m = ist.getMinutes();
  const s = ist.getSeconds();
  const isPm = h >= 12;
  const display = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return { display, isPm };
}

const COOLDOWN_MS = 5 * 60 * 1000;
const LS_KEY = 'contact_last_sent';

function getCooldownRemaining(): number {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return 0;
  const elapsed = Date.now() - parseInt(raw, 10);
  return Math.max(0, COOLDOWN_MS - elapsed);
}

function formatTime(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function InteractiveHoverButton({ children, className = '', disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={disabled}
      className={`group relative w-auto cursor-pointer overflow-hidden rounded-full border border-fg/15 p-2 px-6 text-center font-semibold bg-fg text-bg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="h-2 w-2 rounded-full bg-bg transition-all duration-300 group-hover:scale-[100.8] group-disabled:scale-100" />
        <span className="inline-block text-sm transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100 text-fg text-sm">
        <span>{children}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

const HEADING = "Let's work together";

function FocusInput({
  label,
  type = 'text',
  multiline = false,
  required = false,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  multiline?: boolean;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focus, setFocus] = useState(false);
  const id = `field-${label.toLowerCase()}`;

  return (
    <label htmlFor={id} className="relative block">
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">
        {label}
      </span>
      <div className="relative mt-2">
        {multiline ? (
          <textarea
            id={id}
            required={required}
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            data-cursor="hover"
            className="w-full bg-transparent px-4 py-3 text-sm outline-none resize-none rounded-lg border border-fg/10 placeholder:text-muted/60"
            placeholder=" "
          />
        ) : (
          <input
            id={id}
            type={type}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            data-cursor="hover"
            className="w-full bg-transparent px-4 py-3 text-sm outline-none rounded-lg border border-fg/10 placeholder:text-muted/60"
            placeholder=" "
          />
        )}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <motion.rect
            x={0.5}
            y={0.5}
            width="calc(100% - 1px)"
            height="calc(100% - 1px)"
            rx={8}
            ry={8}
            fill="none"
            stroke="rgb(var(--accent))"
            strokeWidth={1.5}
            pathLength={1}
            initial={false}
            animate={{ pathLength: focus ? 1 : 0, opacity: focus ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.5, ease: 'easeInOut' }, opacity: { duration: 0.2 } }}
            style={{ pathOffset: 0.625 }}
          />
        </svg>
      </div>
    </label>
  );
}

function LocationCard() {
  const { display, isPm } = useLocalTime();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.45 }}
      className="mt-8 hairline rounded-xl p-4 flex items-center justify-between bg-fg/[0.02]"
    >
      <div className="flex items-center gap-3">
        <span className="text-accent text-lg">◎</span>
        <div>
          <p className="text-sm font-medium">Kozhikode, Kerala</p>
          <p className="font-mono text-[10px] text-muted tracking-wide mt-0.5">
            UTC +5:30
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span
          className="font-mono text-base font-bold tabular-nums"
          style={{ color: isPm ? 'rgb(var(--accent))' : 'rgb(var(--fg))' }}
        >
          {display}
        </span>
        <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-muted mt-0.5">My time</span>
      </div>
    </motion.div>
  );
}

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [cooldown, setCooldown] = useState<number>(() => getCooldownRemaining());

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      const remaining = getCooldownRemaining();
      setCooldown(remaining);
      if (remaining <= 0) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown > 0]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setStatus('sending');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

    const [{ error }] = await Promise.all([
      supabase.from('messages').insert([{ name, email, message }]),
      fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      }).catch(() => null),
    ]);

    if (error) {
      setStatus('error');
      window.setTimeout(() => setStatus('idle'), 4000);
    } else {
      localStorage.setItem(LS_KEY, Date.now().toString());
      setCooldown(COOLDOWN_MS);
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
      window.setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section id="contact" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-6">
          08 / contact
        </p>

        <p className="text-base text-fg/45 mb-4">
          <FadeText text="Have an idea? Let's build it." delay={0.1} />
        </p>

        <h2
          className="text-4xl md:text-7xl font-semibold tracking-tight leading-[1.05]"
          aria-label={HEADING}
        >
          <span className="inline-flex flex-wrap gap-x-[0.25em]" aria-hidden>
            {HEADING.split(' ').map((word, i) => (
              <span key={i} className="overflow-hidden inline-block">
                <motion.span
                  initial={{ y: '110%', opacity: 0 }}
                  whileInView={{ y: '0%', opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="text-lg text-fg/80 max-w-md">
              Open to interesting roles, collaborations, and freelance work. Drop a line. I read everything.
            </p>

            <div className="mt-10 space-y-5 font-mono text-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-muted text-xs uppercase tracking-[0.2em]">Email</span>
                <a
                  href="mailto:robinkevin648@gmail.com"
                  data-cursor="hover"
                  className="link-underline text-fg"
                >
                  robinkevin648@gmail.com
                </a>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-muted text-xs uppercase tracking-[0.2em]">LinkedIn</span>
                <a
                  href="https://linkedin.com/in/kevinsylvester6642"
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="hover"
                  className="link-underline text-fg"
                >
                  linkedin.com/in/kevinsylvester6642
                </a>
              </div>
            </div>

            <LocationCard />
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <FocusInput label="Name" required value={name} onChange={setName} />
            <FocusInput label="Email" type="email" required value={email} onChange={setEmail} />
            <FocusInput label="Message" multiline required value={message} onChange={setMessage} />
            <div className="flex items-center gap-4 flex-wrap">
              <InteractiveHoverButton
                type="submit"
                disabled={status === 'sending' || cooldown > 0}
                data-cursor="hover"
              >
                {status === 'sending' ? 'Sending…' : cooldown > 0 ? `Wait ${formatTime(cooldown)}` : 'Send Message'}
              </InteractiveHoverButton>
              <AnimatePresence>
                {status === 'sent' && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="font-mono text-xs text-accent"
                  >
                    ✓ message sent — I'll be in touch
                  </motion.span>
                )}
                {status === 'error' && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="font-mono text-xs text-red-400"
                  >
                    ✕ something went wrong — try again
                  </motion.span>
                )}
                {cooldown > 0 && status === 'idle' && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="font-mono text-xs text-muted"
                  >
                    you can send another message in {formatTime(cooldown)}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>

        <footer className="mt-32 hairline-t pt-8 flex items-center justify-center text-xs text-muted">
          <span className="font-mono">© {new Date().getFullYear()} Kevin Robin</span>
        </footer>
      </div>
    </section>
  );
}
