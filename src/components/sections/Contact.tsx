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
      className={`group relative w-auto cursor-pointer overflow-hidden border border-fg/15 p-2.5 px-7 text-center font-mono text-[11px] uppercase tracking-[0.2em] bg-fg text-bg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="h-2 w-2 rounded-full bg-bg transition-all duration-300 group-hover:scale-[100.8] group-disabled:scale-100" />
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100 text-fg">
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
            className="w-full bg-transparent px-0 py-3 text-sm outline-none resize-none rounded-none border-0 border-b border-fg/20 placeholder:text-muted/60"
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
            className="w-full bg-transparent px-0 py-3 text-sm outline-none rounded-none border-0 border-b border-fg/20 placeholder:text-muted/60"
            placeholder=" "
          />
        )}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1.5px] bg-fg"
          initial={false}
          animate={{ scaleX: focus ? 1 : 0 }}
          transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
          style={{ transformOrigin: 'left' }}
        />
      </div>
    </label>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      data-cursor="hover"
      aria-label={copied ? 'Copied' : `Copy ${value}`}
      className="relative shrink-0 text-muted hover:text-fg transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.svg
            key="check"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            <path d="M20 6L9 17l-5-5" />
          </motion.svg>
        ) : (
          <motion.svg
            key="copy"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
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
      className="mt-8 hairline p-4 flex items-center justify-between bg-fg/[0.02]"
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
    if (!supabase) { setStatus('error'); return; }
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
    <section id="contact" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="hairline-t flex items-baseline justify-between pt-4 mb-8 md:mb-12"
        >
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-muted">(08)</span>
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-muted">Contact</span>
        </motion.div>

        <p className="font-mono text-xs tracking-[0.18em] uppercase text-muted mb-4">
          <FadeText text="Have an idea? Let's build it." delay={0.1} />
        </p>

        <h2
          className="display-type"
          style={{ fontSize: 'clamp(2.8rem, 9vw, 8rem)' }}
          aria-label={HEADING}
        >
          <span className="inline-flex flex-wrap gap-x-[0.22em]" aria-hidden>
            {HEADING.split(' ').map((word, i) => (
              <span key={i} className="overflow-hidden inline-block pb-[0.08em] -mb-[0.08em]">
                <motion.span
                  initial={{ y: '110%' }}
                  whileInView={{ y: '0%' }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.8, delay: i * 0.07, ease: [0.76, 0, 0.24, 1] }}
                  className={`inline-block ${i === HEADING.split(' ').length - 1 ? 'stroke-text' : ''}`}
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
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-3">
                <span className="text-muted text-xs uppercase tracking-[0.2em]">Email</span>
                <a
                  href="mailto:robinkevin648@gmail.com"
                  data-cursor="hover"
                  className="link-underline min-w-0 break-all text-fg"
                >
                  robinkevin648@gmail.com
                </a>
                <CopyButton value="robinkevin648@gmail.com" />
              </div>
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-3">
                <span className="text-muted text-xs uppercase tracking-[0.2em]">LinkedIn</span>
                <a
                  href="https://linkedin.com/in/kevinsylvester6642"
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="hover"
                  className="link-underline min-w-0 break-all text-fg"
                >
                  linkedin.com/in/kevinsylvester6642
                </a>
                <CopyButton value="https://linkedin.com/in/kevinsylvester6642" />
              </div>
            </div>

            <LocationCard />
          </div>

          <form id="contact-form" data-scroll-target aria-label="Send a message" onSubmit={onSubmit} className="space-y-5">
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

      </div>
    </section>
  );
}
