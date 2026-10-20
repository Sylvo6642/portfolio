import { forwardRef, useId } from 'react';

/** The KR mark as three strokes, traced from KR_light.png (500×500): stem, K arm flowing into the R, K leg */
export const KR_PATHS = [
  'M144.5 146 V356',
  'M150 259.5 L254 155.5 H309 A52 52 0 0 1 309 259.5 H272.4 L362.4 356',
  'M178.6 230.9 L295.4 356',
];
/** Centre of the mark, in path coordinates */
export const KR_CENTER = [252.5, 247.5] as const;

/** Static KR logo in currentColor; KRLoader animates this same markup */
export const KRLogo = forwardRef<SVGSVGElement, { className?: string }>(function KRLogo({ className }, ref) {
  // useId's colons would break the url(#…) reference
  const clip = `kr-clip-${useId().replace(/:/g, '')}`;
  return (
    <svg ref={ref} viewBox="122.5 117.5 260 260" className={className} overflow="visible" aria-hidden>
      <defs>
        {/* Cuts the leg ends flat, like the PNG */}
        <clipPath id={clip}><rect x="0" y="145.5" width="500" height="204" /></clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <g data-kr-spin>
          {KR_PATHS.map((d) => (
            <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth={20} strokeLinejoin="miter" />
          ))}
        </g>
      </g>
    </svg>
  );
});
