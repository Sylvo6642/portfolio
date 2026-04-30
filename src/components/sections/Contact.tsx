import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';

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

    const { error } = await supabase
      .from('messages')
      .insert([{ name, email, message }]);

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
          07 / contact
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
              Open to interesting roles, collaborations, and freelance work. Drop a line — I read everything.
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
              <div className="flex items-baseline gap-3">
                <span className="text-muted text-xs uppercase tracking-[0.2em]">Based</span>
                <span className="text-fg">Kozhikode, Kerala · IN</span>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <FocusInput label="Name" required value={name} onChange={setName} />
            <FocusInput label="Email" type="email" required value={email} onChange={setEmail} />
            <FocusInput label="Message" multiline required value={message} onChange={setMessage} />
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="submit"
                disabled={status === 'sending' || cooldown > 0}
                data-cursor="hover"
                className="inline-flex items-center gap-2 rounded-full bg-fg text-bg px-6 py-3 text-sm font-medium transition-transform hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {status === 'sending' ? 'Sending…' : cooldown > 0 ? `wait ${formatTime(cooldown)}` : 'Send Message'}
                {status !== 'sending' && cooldown <= 0 && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                )}
              </button>
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

        <footer className="mt-32 hairline-t pt-8 flex items-center justify-between text-xs text-muted">
          <span className="font-mono">© {new Date().getFullYear()} Kevin Robin</span>
          <span className="font-mono">kevin robin · {new Date().getFullYear()}</span>
        </footer>
      </div>
    </section>
  );
}
