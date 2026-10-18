import { useEffect, useState } from 'react';
import { SOCIALS } from './Navbar';

function useKeralaTime() {
  const format = () =>
    new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = window.setInterval(() => setTime(format()), 10_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

/* Bottom bar of the dark contact surface */
export function Footer() {
  const time = useKeralaTime();

  return (
    <footer aria-label="Site footer" className="on-ink">
      <div className="flex flex-col gap-8 px-5 sm:px-8 md:px-10 pt-24 md:pt-36 pb-8 md:flex-row md:items-end md:justify-between">
        {/* Bottom-aligned so the copyright line sits level with the labelled values beside it */}
        <div className="flex items-end gap-10 md:gap-14">
          <p className="text-[15px]">© {new Date().getFullYear()} Kevin Robin</p>
          <div>
            <p className="eyebrow mb-3">Local time</p>
            <p className="text-[15px] tabular-nums">{time} IST</p>
          </div>
        </div>
        <div>
          <p className="eyebrow mb-3">Socials</p>
          <div className="flex flex-wrap gap-x-7 gap-y-2 text-[15px]">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} className="nav-link py-0" target={s.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
