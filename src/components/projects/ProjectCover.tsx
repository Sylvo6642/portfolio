import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { PersonalProject } from '../../data/projects';

/**
 * Cover art for a project card. A project with `cover` media shows that image or video; the rest
 * get a drawn cover. Drawn covers are laid out on a 520px square stage that is scaled to fit the
 * card, so the same art holds up on a wide desktop card and a narrow phone one.
 */
const STAGE = 520;

function useFitScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (width && height) setScale(Math.min(width, height) / STAGE);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, scale };
}

function Stage({ bg, children }: { bg: string; children: ReactNode }) {
  const { ref, scale } = useFitScale();
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" style={{ background: bg }} aria-hidden>
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: STAGE, height: STAGE, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

const bar = (width: string, color = '#EEE8E1') => (
  <div style={{ height: 7, width, borderRadius: 4, background: color }} />
);

function ClausifyArt() {
  const chip = 'absolute flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-3.5 py-2.5 text-[12px] text-[#2A1F18] shadow-[0_14px_30px_rgba(60,40,20,0.14)]';
  return (
    <Stage bg="#EFE6DB">
      <div className="absolute left-1/2 top-1/2 h-[380px] w-[300px] rounded-2xl bg-[#E2D5C5]" style={{ transform: 'translate(-36%, -46%) rotate(7deg)' }} />
      <div
        className="absolute left-1/2 top-1/2 flex h-[380px] w-[300px] flex-col gap-3 rounded-2xl bg-white p-7 text-[#2A1F18] shadow-[0_30px_60px_rgba(60,40,20,0.14)]"
        style={{ transform: 'translate(-58%, -52%) rotate(-5deg)' }}
      >
        <div className="text-[10px] uppercase tracking-[0.14em] text-[#7A6D62]">AI contract review</div>
        <div className="mb-2 text-[30px] leading-[1.05] tracking-[-0.02em]">Fine print.<br />Plain English.</div>
        {bar('100%')}
        {bar('88%')}
        {bar('94%', '#F5D48A')}
        {bar('70%', '#F5D48A')}
        {bar('96%')}
        {bar('60%')}
        <div className="mt-auto self-start rounded-full bg-[#2A1F18] px-3.5 py-2 text-[11px] text-[#FBF8F4]">Analyse a contract</div>
      </div>
      <div className={chip} style={{ left: '50%', top: '50%', transform: 'translate(14%, -18%)' }}>
        <span className="h-2 w-2 rounded-full bg-[#D9480F]" />Auto-renewal clause
      </div>
      <div className={chip} style={{ left: '50%', top: '50%', transform: 'translate(4%, 70%)' }}>
        <span className="h-2 w-2 rounded-full bg-[#E8A317]" />Clause 7.2 · review
      </div>
    </Stage>
  );
}

function CommitGridArt() {
  const cells = useMemo(() => {
    // Deterministic pseudo-random levels so the art is stable between renders
    const shades = ['#161B22', '#0E4429', '#006D32', '#26A641', '#39D353'];
    let seed = 7;
    return Array.from({ length: 22 * 8 }, () => {
      seed = (seed * 9301 + 49297) % 233280;
      const r = seed / 233280;
      return shades[r < 0.35 ? 0 : r < 0.55 ? 1 : r < 0.75 ? 2 : r < 0.9 ? 3 : 4];
    });
  }, []);
  return (
    <Stage bg="#0D1117">
      <div
        className="absolute left-1/2 top-1/2 grid gap-[5px]"
        style={{ gridTemplateColumns: 'repeat(22, 16px)', transform: 'translate(-50%, -50%) perspective(1100px) rotateX(52deg) rotateZ(-32deg) scale(1.25)' }}
      >
        {cells.map((c, i) => <span key={i} className="h-4 w-4 rounded-[3px]" style={{ background: c }} />)}
      </div>
      <div className="absolute bottom-7 left-7 font-mono text-[13px] text-[#7EE787]">&lt;CommitGrid /&gt;</div>
      <div className="absolute bottom-7 right-7 font-mono text-[11px] text-[#8B949E]">React component</div>
    </Stage>
  );
}

function VoidVaultArt() {
  const file = 'flex justify-between rounded-[10px] bg-[#161A36] px-3 py-2.5 text-[12px] text-[#C7D2FE]';
  return (
    <Stage bg="#0A0C18">
      <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-[48px] border border-[#151935]" />
      <div className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-[64px] border border-[#11142B]" />
      <div className="absolute left-1/2 top-1/2 flex w-[320px] -translate-x-1/2 -translate-y-1/2 flex-col gap-3.5 rounded-[20px] border border-[#262B55] bg-[#12152B] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between">
          <div className="grid h-[52px] w-[52px] place-items-center rounded-2xl bg-[#1D2250]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <div className="rounded-full border border-[#333A78] px-2.5 py-1.5 font-mono text-[11px] text-[#A5B4FC]">AES-256-GCM</div>
        </div>
        <div className="text-[12px] text-[#8C93C9]">Unlock vault</div>
        <div className="flex h-[42px] items-center rounded-[10px] border border-[#262B55] bg-[#0C0F22] px-3.5 text-[14px] tracking-[0.3em] text-[#C7D2FE]">••••••••••</div>
        <div className="mt-1 flex flex-col gap-2">
          <div className={file}><span>contract.pdf</span><span className="text-[#6E76B8]">locked</span></div>
          <div className={file}><span>photos.zip</span><span className="text-[#6E76B8]">locked</span></div>
        </div>
      </div>
    </Stage>
  );
}

function ProfileCard({ avatar, tags, primary, style }: { avatar: string; tags: string[]; primary?: boolean; style: CSSProperties }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 flex flex-col gap-2.5 rounded-[18px] bg-white p-5 text-[#2A1F18]"
      style={{ width: primary ? 230 : 210, height: primary ? 290 : 270, boxShadow: `0 ${primary ? 30 : 24}px ${primary ? 60 : 50}px rgba(40,30,90,${primary ? 0.18 : 0.12})`, ...style }}
    >
      <div className="rounded-full" style={{ width: primary ? 54 : 48, height: primary ? 54 : 48, background: avatar }} />
      <div className="h-[9px] w-[70%] rounded-[5px] bg-[#E6E4F2]" />
      <div className="h-[7px] w-[48%] rounded bg-[#EFEEF7]" />
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {tags.map((t) => <span key={t} className="rounded-full bg-[#F3F1FB] px-2.5 py-1 text-[11px] text-[#4C3FA0]">{t}</span>)}
      </div>
      <div className={`mt-auto rounded-[10px] py-2.5 text-center text-[12px] ${primary ? 'bg-[#2A1F18] text-[#FBF8F4]' : 'bg-[#EFEEF7]'}`}>{primary ? 'Hire' : 'View profile'}</div>
    </div>
  );
}

function SkillDashArt() {
  return (
    <Stage bg="#ECEBF7">
      <ProfileCard avatar="#FDBA74" tags={['Plumbing', 'Repairs']} style={{ transform: 'translate(-112%, -44%) rotate(-9deg)' }} />
      <ProfileCard avatar="#93C5FD" tags={['Electrical', 'Wiring']} style={{ transform: 'translate(12%, -56%) rotate(8deg)' }} />
      <ProfileCard avatar="#C4B5FD" tags={['Carpentry', 'Painting', 'Nearby']} primary style={{ transform: 'translate(-50%, -42%)' }} />
    </Stage>
  );
}

const DRAWN: Record<string, () => JSX.Element> = {
  Clausify: ClausifyArt,
  CommitGrid: CommitGridArt,
  'Void Vault': VoidVaultArt,
  SkillDash: SkillDashArt,
};

export function ProjectCover({ project, playing = true }: { project: PersonalProject; playing?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cover = project.cover;

  // Only the card in focus plays, so four videos never decode at once
  useLayoutEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing]);

  if (cover?.type === 'image') {
    return <img src={cover.src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />;
  }
  if (cover?.type === 'video') {
    return (
      <video
        ref={videoRef}
        src={cover.src}
        poster={cover.poster}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      />
    );
  }
  const Art = DRAWN[project.name];
  return Art ? <Art /> : <div className="absolute inset-0" style={{ background: project.previewBg }} aria-hidden />;
}
