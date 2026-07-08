export function BasketIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="basketFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="basketRimFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="66" cy="122" rx="38" ry="6" fill="#1e3a8a" opacity="0.12" />

      {/* Handle */}
      <path d="M46 46 C46 26 86 26 86 46" stroke="#4f46e5" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Gifts peeking over the rim */}
      <rect x="50" y="34" width="18" height="18" rx="3" fill="#a5b4fc" transform="rotate(-8 59 43)" />
      <rect x="66" y="30" width="16" height="16" rx="3" fill="#818cf8" transform="rotate(10 74 38)" />

      {/* Basket rim */}
      <rect x="34" y="48" width="64" height="14" rx="6" fill="url(#basketRimFace)" />

      {/* Basket body (tapered) */}
      <path d="M38 60 L94 60 L86 112 Q66 120 46 112 Z" fill="url(#basketFace)" />

      {/* Weave lines */}
      <path d="M42 70 L90 70" stroke="#eef2ff" strokeWidth="2" opacity="0.5" />
      <path d="M44 84 L88 84" stroke="#eef2ff" strokeWidth="2" opacity="0.5" />
      <path d="M46 98 L84 98" stroke="#eef2ff" strokeWidth="2" opacity="0.5" />

      {/* Floating coin */}
      <circle cx="24" cy="30" r="11" fill="#facc15" />
      <text x="24" y="35" fontSize="12" fontWeight="bold" fill="#a16207" textAnchor="middle">₹</text>

      {/* Floating heart */}
      <path
        d="M112 54 C108 48 98 51 98 59 C98 66 112 76 112 76 C112 76 126 66 126 59 C126 51 116 48 112 54 Z"
        fill="#f87171"
      />
    </svg>
  );
}
