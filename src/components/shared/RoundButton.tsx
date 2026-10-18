import type { MouseEvent, ReactNode } from 'react';
import { Magnetic } from './Magnetic';

/**
 * Circular (or pill) button that drifts toward the cursor and floods with
 * `fillClass` from below on hover. Size and base colors come from `className`.
 */
export function RoundButton({
  children,
  href,
  onClick,
  className = '',
  fillClass = 'bg-accent',
  external = false,
  ariaLabel,
  ariaExpanded,
  strength = 0.35,
}: {
  children: ReactNode;
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  className?: string;
  fillClass?: string;
  external?: boolean;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  strength?: number;
}) {
  const content = (
    <>
      <span aria-hidden className={`btn-fill ${fillClass}`} />
      <span className="relative z-[1]">{children}</span>
    </>
  );
  const cls = `btn-round ${className}`;

  return (
    <Magnetic strength={strength} className="inline-block">
      {href ? (
        <a
          href={href}
          onClick={onClick}
          className={cls}
          aria-label={ariaLabel}
          data-cursor="hover"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {content}
        </a>
      ) : (
        <button type="button" onClick={onClick} className={cls} aria-label={ariaLabel} aria-expanded={ariaExpanded} data-cursor="hover">
          {content}
        </button>
      )}
    </Magnetic>
  );
}
