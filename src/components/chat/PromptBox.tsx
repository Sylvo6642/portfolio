import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';

export const MAX_CHARS = 300;
const HINT_MS = 3200;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  /** Several placeholders take turns, fading from one to the next */
  placeholder: string | string[];
  /** Typing is blocked (out of questions) */
  disabled?: boolean;
  /** Sending is blocked (an answer is still streaming) */
  busy?: boolean;
  /** Small text under the box (the quota) */
  footer?: ReactNode;
  /** 'lg' on the chat home, 'md' in the conversation */
  size?: 'lg' | 'md';
};

/**
 * Rounded prompt box: the question on top, a toolbar row with the send button
 * underneath, and the quota below the box.
 */
export const PromptBox = forwardRef<HTMLTextAreaElement, Props>(function PromptBox(
  { value, onChange, onSubmit, placeholder, disabled, busy, footer, size = 'md' },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);
  const lg = size === 'lg';
  const textSize = lg ? 'text-[16px]' : 'text-[16px] md:text-[15px]';

  const hints = Array.isArray(placeholder) ? placeholder : [placeholder];
  const rotating = hints.length > 1;
  const [hint, setHint] = useState(0);
  useEffect(() => {
    if (!rotating || value) return;
    const id = window.setInterval(() => setHint((h) => (h + 1) % hints.length), HINT_MS);
    return () => window.clearInterval(id);
  }, [rotating, value, hints.length]);

  // Grow with the text up to a few lines, then scroll
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, lg ? 200 : 140)}px`;
  }, [value, lg]);

  const canSend = !!value.trim() && !busy && !disabled;
    const nearLimit = value.length > MAX_CHARS - 60;
  
    const submit = (e?: FormEvent) => {
      e?.preventDefault();
      if (canSend) onSubmit(value);
    };
  
    return (
      <form onSubmit={submit} className="w-full">
        <div
          className={`rounded-2xl bg-surface ring-1 ring-edge transition-shadow focus-within:ring-edge-strong focus-within:shadow-[0_4px_24px_rgb(0_0_0/0.06)] ${lg ? 'px-4 pb-3 pt-3.5' : 'px-3.5 pb-2.5 pt-3'} ${disabled ? 'opacity-60' : ''}`}
        >
          <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); }
            }}
            rows={lg ? 2 : 1}
            maxLength={MAX_CHARS}
            disabled={disabled}
            placeholder={rotating ? '' : hints[0]}
            aria-label="Your question"
            enterKeyHint="send"
            // 16px keeps iOS Safari from zooming in on focus
            className={`block w-full resize-none bg-transparent leading-6 text-fg placeholder:text-muted/60 focus:outline-none ${textSize}`}
          />
          {rotating && !value && (
            <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={hint}
              aria-hidden
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`pointer-events-none absolute inset-x-0 top-0 truncate leading-6 text-muted/60 ${textSize}`}
            >
              {hints[hint]}
            </motion.span>
          </AnimatePresence>
        )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[12px] text-muted">
            {nearLimit ? `${value.length}/${MAX_CHARS}` : 'AI can make mistakes'}
          </span>
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-on-accent transition-opacity disabled:opacity-30"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        </div>
      </div>
      {footer && <p className="mt-2 px-3 text-[12px] text-muted">{footer}</p>}
    </form>
  );
});
