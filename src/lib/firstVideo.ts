import { PERSONAL_PROJECTS } from '../data/projects';

// The first films a visitor meets: the WorkTwirl explainer, then the first project cover
const TWIRL_FILM = '/media/rag-explainer';

function firstSources(): string[] {
  const probe = document.createElement('video');
  const twirl = probe.canPlayType('video/webm') ? `${TWIRL_FILM}.webm` : `${TWIRL_FILM}.mp4`;
  const cover = PERSONAL_PROJECTS.find((p) => p.cover?.type === 'video')?.cover?.src;
  return cover ? [twirl, cover] : [twirl];
}

// Resolves once a hidden <video> can play through, errors, or the shared deadline passes
function warm(src: string): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const finish = () => {
      video.removeEventListener('canplaythrough', finish);
      video.removeEventListener('error', finish);
      resolve();
    };
    video.addEventListener('canplaythrough', finish, { once: true });
    video.addEventListener('error', finish, { once: true });
    video.muted = true;
    video.preload = 'auto';
    video.src = src;
    video.load();
  });
}

// Starts buffering the first films so they're in the HTTP cache when their sections mount;
// never takes longer than maxMs, so a slow network can't hold the loader
export function warmFirstVideos(maxMs: number): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  const ready = Promise.all(firstSources().map(warm)).then(() => undefined);
  const deadline = new Promise<void>((resolve) => window.setTimeout(resolve, maxMs));
  return Promise.race([ready, deadline]);
}
