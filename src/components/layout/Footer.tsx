import { scrollToTop } from '../../lib/scroll';

/**
 * Curtain footer, phantom.land style.
 * Fixed behind <main> (which carries an equal bottom margin), so the page
 * content slides up like a curtain and uncovers the giant wordmark.
 */
export function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="fixed bottom-0 left-0 right-0 z-0 h-[55vh] md:h-[60vh] flex flex-col justify-end overflow-hidden"
    >
      <div className="mx-auto max-w-[1400px] w-full px-6 flex-1 flex flex-col justify-center">
        <p
          className="display-type text-center select-none"
          style={{ fontSize: 'clamp(3.2rem, 12.5vw, 12rem)', lineHeight: 0.85 }}
        >
          Kevin <span className="stroke-text">Robin</span>
        </p>
      </div>

      <div className="mx-auto max-w-[1400px] w-full px-6 pb-8">
        <div className="hairline-t pt-6 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] tracking-[0.2em] uppercase text-muted">
          <span>© {new Date().getFullYear()} Kevin Robin</span>
          <span className="hidden sm:inline">Kozhikode, Kerala — UTC +5:30</span>
          <button
            type="button"
            data-cursor="hover"
            onClick={() => scrollToTop()}
            className="hover:text-fg transition-colors"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
