import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect, useRef, type FormEvent, type ButtonHTMLAttributes } from 'react';
import { supabase } from '../../lib/supabase';
import { RoundButton } from '../shared/RoundButton';

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
      className={`group relative w-auto cursor-pointer overflow-hidden rounded-full border border-fg/15 py-4 px-9 text-center text-[15px] bg-fg text-bg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
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
      <span className="eyebrow">
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

const EMAIL = 'robinkevin648@gmail.com';
const LINKEDIN = 'https://linkedin.com/in/kevinsylvester6642';
const EASE = [0.76, 0, 0.24, 1] as const;

/* Page-coloured bowl hanging over the dark section; it flattens as the section scrolls up */
function CurvedEdge() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const height = useTransform(scrollYProgress, [0, 0.9], ['12vh', '0vh']);
  return (
    <motion.div ref={ref} style={{ height }} className="relative z-[1] bg-ink" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden">
        <div className="absolute left-[-25%] bottom-0 h-[750%] w-[150%] rounded-b-[50%] bg-page shadow-[0_40px_60px_rgb(0_0_0/0.35)]" />
      </div>
    </motion.div>
  );
}

function Pill({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      data-cursor="hover"
      className="btn-round border border-fg/25 hover:text-on-accent transition-colors duration-300 px-7 py-5 md:px-9 md:py-6 text-[15px] md:text-base"
    >
      <span aria-hidden className="btn-fill bg-accent" />
      <span className="relative z-[1]">{children}</span>
    </a>
  );
}

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [cooldown, setCooldown] = useState<number>(() => getCooldownRemaining());
  const [formOpen, setFormOpen] = useState(false);

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
    <>
      <CurvedEdge />
      <section id="contact" className="on-ink relative overflow-hidden">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 md:px-10 pt-[18vh] md:pt-[22vh]">
          <div className="flex items-start justify-between gap-6 md:px-[6%]">
            <motion.h2
              className="display-type text-[clamp(3rem,8.6vw,8.5rem)] leading-[1.02] tracking-[-0.045em]"
              aria-label={HEADING}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
            >
              <span className="flex items-center gap-[0.22em]" aria-hidden>
                <motion.img
                  src="/kevin.jpg"
                  alt=""
                  className="h-[0.78em] w-[0.78em] rounded-full object-cover object-[50%_22%]"
                  variants={{ hidden: { scale: 0 }, show: { scale: 1, transition: { duration: 0.8, ease: EASE } } }}
                />
                <span className="overflow-hidden pb-[0.08em] -mb-[0.08em]">
                  <motion.span className="inline-block" variants={{ hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 0.8, ease: EASE } } }}>
                    Let&rsquo;s work
                  </motion.span>
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]" aria-hidden>
                <motion.span className="inline-block" variants={{ hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 0.8, ease: EASE, delay: 0.08 } } }}>
                  together
                </motion.span>
              </span>
            </motion.h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="hidden md:block mt-[22vh] shrink-0" aria-hidden>
              <path d="M18 6L6 18M16 18H6V8" />
            </svg>
          </div>

          {/* Divider with the call-to-action riding on it */}
          <div className="relative mt-20 md:mt-28 border-t border-fg/20 md:mx-[6%]">
            <div className="absolute right-0 sm:right-[8%] md:right-[12%] top-0 -translate-y-1/2">
              <RoundButton
                onClick={() => {
                  setFormOpen((v) => !v);
                  if (!formOpen) window.setTimeout(() => document.getElementById('field-name')?.focus({ preventScroll: true }), 450);
                }}
                ariaExpanded={formOpen}
                className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 bg-accent text-on-accent text-[15px] md:text-base"
                fillClass="bg-accent-hover"
              >
                {formOpen ? 'Close form' : 'Get in touch'}
              </RoundButton>
            </div>
          </div>

          <div className="pt-24 sm:pt-16 md:mx-[6%] flex flex-wrap items-center gap-3">
            <Pill href={`mailto:${EMAIL}`}>{EMAIL}</Pill>
            <span className="-ml-1 mr-2"><CopyButton value={EMAIL} /></span>
            <Pill href={LINKEDIN} external>LinkedIn</Pill>
          </div>

          <AnimatePresence initial={false}>
            {formOpen && (
              <motion.div
                key="form"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="overflow-hidden md:mx-[6%]"
              >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16 pt-16 md:pt-20">
                  <p className="text-[15px] md:text-lg leading-[1.7] text-fg/70 max-w-sm">
                    Open to interesting roles, collaborations, and freelance work. Drop a line — I read everything.
                  </p>
                  <form id="contact-form" aria-label="Send a message" onSubmit={onSubmit} className="space-y-6">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
