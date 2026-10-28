import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const EASE = [0.76, 0, 0.24, 1] as const;

export function Hero({ ready = true }: { ready?: boolean }) {
  const reduced = useReducedMotion();

  // The next section slides over the (sticky) hero — dim and settle it as it goes
  const { scrollY } = useScroll();
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const shade = useTransform(scrollY, [0, vh], [0, 0.55]);
  const photoY = useTransform(scrollY, [0, vh], [0, vh * 0.12]);
  const contentScale = useTransform(scrollY, [0, vh], [1, 0.94]);

  const enter = (delay: number) => ({
    initial: { y: 60, opacity: 0 },
    animate: ready ? { y: 0, opacity: 1 } : undefined,
    transition: { duration: 1.1, ease: EASE, delay },
  });

  return (
    <section
      id="hero"
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-hero text-[rgb(var(--hero-fg))]"
      aria-label="Kevin Robin — Full-Stack & AI Engineer"
    >
      {/* Studio spotlight in light, dot grid on ink in dark */}
      <div aria-hidden className="hero-light pointer-events-none absolute inset-0" />
      <div aria-hidden className="hero-dots pointer-events-none absolute inset-0" />

      {/* Its own layer, so the scroll-linked scale moves pixels instead of redrawing the giant name */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center md:block"
        style={reduced ? undefined : { scale: contentScale, willChange: 'transform' }}
      >
        {/* Stacked on phones, one line across the top on desktop */}
        <motion.h1
          {...enter(0)}
          className="relative z-0 pt-[88px] md:pt-[clamp(84px,11svh,112px)] px-5 md:px-10 text-center font-medium text-[26vw] md:text-[clamp(88px,15.5vw,236px)] leading-[0.9] tracking-[-0.055em] md:whitespace-nowrap"
        >
          Kevin <br className="md:hidden" />
          Robin
        </motion.h1>

        {/* Role: under the name on phones, bottom right beside the portrait on desktop */}
        <motion.div
          {...enter(0.25)}
          className="relative z-[2] mt-6 flex max-w-[300px] flex-col items-center gap-2 px-5 text-center md:absolute md:right-[4%] md:bottom-[96px] md:mt-0 md:max-w-[360px] md:items-start md:gap-[22px] md:px-0 md:text-left"
        >
          <p className="text-[26px] md:text-[40px] leading-[1.12] tracking-[-0.025em] whitespace-nowrap">
            Full-Stack &amp; <br className="hidden md:inline" />
            AI Engineer
          </p>
          <p className="text-[15px] md:text-[17px] leading-[1.5] text-[rgb(var(--hero-muted))]">
            I build LLM features that still give the right answer with a real user’s data.
          </p>
        </motion.div>

        {/* Cut-out portrait standing on the bottom edge, in front of the name */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-[1] flex justify-center"
          style={reduced ? undefined : { y: photoY }}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        >
          {/* Nudged a touch right of centre on desktop, so the role has room beside it */}
          <div className="aspect-[1122/1080] w-full max-h-[50svh] md:max-h-none md:w-[min(640px,70%,calc((100svh_-_230px)*1.039))] md:translate-x-[4%]">
            <img
              src="/kevin-hero.webp"
              alt=""
              className="h-full w-full object-contain object-bottom select-none pointer-events-none"
              draggable={false}
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </motion.div>
      </motion.div>

      <div aria-hidden className="hero-grain pointer-events-none absolute inset-0 z-[3]" />
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-[4] bg-black" style={{ opacity: shade, willChange: 'opacity' }} />
    </section>
  );
}
