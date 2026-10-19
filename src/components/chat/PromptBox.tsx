import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, type FormEvent, type ReactNode } from 'react';

export const MAX_CHARS = 300;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  /** Typing is blocked (out of questions) */
  disabled?: boolean;
  /** Sending is blocked (an answer is still streaming) */
  busy?: boolean;
  /** Small text under the box: left (quota) and right (model) */
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  /** 'lg' on the chat home, 'md' in the conversation */
  size?: 'lg' | 'md';
};

/**
 * Rounded prompt box: the question on top, a toolbar row with the send button
 * underneath, and quiet details below the box.
 */
export const PromptBox = forwardRef<HTMLTextAreaElement, Props>(function PromptBox(
  { value, onChange, onSubmit, placeholder, disabled, busy, footerLeft, footerRight, size = 'md' },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);
  const lg = size === 'lg';

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
          placeholder={placeholder}
          aria-label="Your question"
          enterKeyHint="send"
          // 16px keeps iOS Safari from zooming in on focus
          className={`block w-full resize-none bg-transparent text-[16px] leading-6 text-fg placeholder:text-muted focus:outline-none ${lg ? 'md:text-[16px]' : 'md:text-[15px]'}`}
        />
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
      {(footerLeft || footerRight) && (
        <div className="mt-2 flex items-center justify-between gap-3 px-3 text-[12px] text-muted">
          <span>{footerLeft}</span>
          <span>{footerRight}</span>
        </div>
      )}
    </form>
  );
});
