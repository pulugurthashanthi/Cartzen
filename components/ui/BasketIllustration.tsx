// Woven crosshatch texture (instead of plain horizontal bands) is what reads
// as "basket" rather than "bucket" — the diagonal cross lines mimic wicker.
const WEAVE_OFFSETS = [-40, -20, 0, 20, 40, 60, 80, 100, 120];

export function BasketIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="basketFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="basketRimFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <clipPath id="basketBodyClip">
          <path d="M30 64 L130 64 L114 120 Q80 130 46 120 Z" />
        </clipPath>
      </defs>

      {/* Shadow */}
      <ellipse cx="80" cy="128" rx="42" ry="6" fill="#1e3a8a" opacity="0.12" />

      {/* Handle */}
      <path d="M54 50 C54 24 106 24 106 50" stroke="#4f46e5" strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* Gift boxes peeking over the rim */}
      <rect x="58" y="36" width="20" height="20" rx="3" fill="#a5b4fc" transform="rotate(-8 68 46)" />
      <rect x="80" y="32" width="18" height="18" rx="3" fill="#818cf8" transform="rotate(10 89 41)" />

      {/* Basket rim — an oval mouth, not a straight bar, so it reads as a 3D vessel */}
      <ellipse cx="80" cy="64" rx="52" ry="11" fill="url(#basketRimFace)" />

      {/* Basket body */}
      <path d="M30 64 L130 64 L114 120 Q80 130 46 120 Z" fill="url(#basketFace)" />

      {/* Woven crosshatch texture, clipped to the body silhouette */}
      <g clipPath="url(#basketBodyClip)" stroke="#eef2ff" strokeWidth="2" opacity="0.45">
        {WEAVE_OFFSETS.map((o) => (
          <line key={`a${o}`} x1={o} y1="50" x2={o + 70} y2="140" />
        ))}
        {WEAVE_OFFSETS.map((o) => (
          <line key={`b${o}`} x1={o + 70} y1="50" x2={o} y2="140" />
        ))}
      </g>

      {/* Rim lip shading */}
      <path d="M30 64 Q80 78 130 64" stroke="#4338ca" strokeWidth="2.5" opacity="0.35" fill="none" />

      {/* Floating coin */}
      <circle cx="20" cy="34" r="12" fill="#facc15" />
      <text x="20" y="39" fontSize="13" fontWeight="bold" fill="#a16207" textAnchor="middle">₹</text>

      {/* Floating heart */}
      <path
        d="M138 58 C134 52 124 55 124 63 C124 70 138 80 138 80 C138 80 152 70 152 63 C152 55 142 52 138 58 Z"
        fill="#f87171"
      />
    </svg>
  );
}
