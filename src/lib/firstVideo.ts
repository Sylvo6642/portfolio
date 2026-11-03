// The first film a visitor meets is the WorkTwirl explainer. Its own <video> buffers from page load
// and reports here, so the loader waits on the element that will actually play, not on a hidden copy
// whose download the real element can't reuse

let release: () => void = () => {};
const ready = new Promise<void>((resolve) => {
  release = resolve;
});

/**
 * Called by the section that shows the film. Pass the element once it's mounted, or null when there
 * is no film to wait for (Reduce Motion shows a still instead)
 */
export function trackFirstFilm(video: HTMLVideoElement | null) {
  if (!video || video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
    release();
    return;
  }
  video.addEventListener('canplaythrough', release, { once: true });
  // With <source> children a failed fetch is reported on the source, not the video
  video.querySelectorAll('source').forEach((s) => s.addEventListener('error', release, { once: true }));
}

/** Resolves once the film can play through, so lesser media can wait their turn behind it */
export const whenFirstFilmReady = () => ready;

// Resolves once the film can play through or maxMs passes, so a slow network can't hold the loader
export function waitForFirstFilm(maxMs: number): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const deadline = new Promise<void>((resolve) => window.setTimeout(resolve, maxMs));
  return Promise.race([ready, deadline]);
}
