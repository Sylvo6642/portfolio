import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

/**
 * A rendered film of a RAG pipeline answering "What has Kevin built with LLMs?":
 * embed the question, retrieve from the corpus, rerank, pack the prompt, then generate a
 * cited answer. Designed in Claude Design and captured frame by frame at 60fps.
 * Plays only while on screen; Reduce Motion gets a still of the finished answer.
 */

const SRC = '/media/rag-explainer';

export function RagVideo({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Low threshold: on phones the card is only a slice of the screen
  const inView = useInView(ref, { amount: 0.2 });
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // play() rejects if autoplay is blocked; the poster frame stays up, which is fine
    if (inView) video.play().catch(() => {});
    else video.pause();
  }, [inView]);

  return (
    <figure ref={ref} className={className}>
      {/* The film is light-only, so it keeps its own background in dark mode and the ring frames it */}
      <div className="aspect-video overflow-hidden rounded-2xl bg-[#FBF8F4] ring-1 ring-accent/30">
        {reduced ? (
          <img
            src={`${SRC}-still.webp`}
            alt=""
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster={`${SRC}-poster.webp`}
            aria-hidden
            className="block h-full w-full object-cover"
          >
            <source src={`${SRC}.webm`} type="video/webm" />
            <source src={`${SRC}.mp4`} type="video/mp4" />
          </video>
        )}
      </div>
      <figcaption className="sr-only">
        A RAG pipeline answering "What has Kevin built with LLMs?": the question is embedded, matched against 128
        chunks of the portfolio, reranked down to three, packed into a prompt, and answered with citations to Clausify
        and this site's AI assistant.
      </figcaption>
    </figure>
  );
}
