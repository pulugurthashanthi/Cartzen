// Picnic basket with a gingham cloth — blue palette to match the app.
// Draw order matters: body → handle → cloth, so the cloth sits over the
// handle's base and the basket rim the way a real draped cloth would.
export function BasketIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 180" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="basketBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id="basketHandle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        {/* Blue gingham: light base + two half-opacity bands; where the bands
            cross, the colour doubles up and reads as the classic check. */}
        <pattern id="gingham" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill="#eff6ff" />
          <rect width="22" height="11" fill="#60a5fa" opacity="0.55" />
          <rect width="11" height="22" fill="#60a5fa" opacity="0.55" />
        </pattern>
        <clipPath id="basketBodyClip">
          <path d="M44 92 L156 92 L145 156 Q143 165 134 166 L66 166 Q57 165 55 156 Z" />
        </clipPath>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="100" cy="170" rx="52" ry="7" fill="#1e3a8a" opacity="0.12" />

      {/* Handle (behind the cloth) */}
      <path d="M62 96 C62 42 138 42 138 96" fill="none" stroke="url(#basketHandle)" strokeWidth="12" strokeLinecap="round" />

      {/* Wicker body */}
      <path d="M44 92 L156 92 L145 156 Q143 165 134 166 L66 166 Q57 165 55 156 Z" fill="url(#basketBody)" />

      {/* Woven texture — dashed rows + a centre seam, clipped to the body */}
      <g clipPath="url(#basketBodyClip)" stroke="#2563eb" strokeLinecap="round" opacity="0.5">
        <g strokeWidth="3.5" strokeDasharray="9 12">
          <line x1="48" y1="108" x2="152" y2="108" />
          <line x1="48" y1="124" x2="152" y2="124" />
          <line x1="50" y1="140" x2="150" y2="140" />
          <line x1="52" y1="154" x2="148" y2="154" />
        </g>
        <line x1="100" y1="92" x2="100" y2="166" strokeWidth="3" opacity="0.6" />
      </g>

      {/* Cloth — top face draped across the rim */}
      <path d="M38 96 L104 84 L166 98 L100 110 Z" fill="url(#gingham)" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Cloth — folded flap hanging over the front-right corner */}
      <path d="M100 110 L166 98 L165 126 Q164 135 155 136 L112 133 Q101 132 100 124 Z" fill="url(#gingham)" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Soft shading on the flap so it reads as a fold, not the same plane */}
      <path d="M100 110 L166 98 L165 126 Q164 135 155 136 L112 133 Q101 132 100 124 Z" fill="#1d4ed8" opacity="0.1" />
    </svg>
  );
}
