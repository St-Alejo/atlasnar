/**
 * ContourBackground — SVG topographic contour lines as decorative background.
 * Generated with feTurbulence; no external assets needed.
 */
export function ContourBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.07,
      }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="contour-noise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.012 0.008"
            numOctaves="6"
            seed="42"
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 20 -10"
            in="noise"
            result="contours"
          />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#contour-noise)" fill="currentColor" />
    </svg>
  );
}
