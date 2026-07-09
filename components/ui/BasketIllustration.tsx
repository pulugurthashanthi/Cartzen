// Hero illustration: a vented shopping basket packed with finds — sneaker,
// handbag, gift box — with headphones and a watch floating above amid
// sparkles. Flat vector with soft gradients in the app's blue palette;
// pink/amber accents kept to the allowed decoratives (heart, coin, sparkles).

function Sparkle({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const q = r * 0.28;
  return (
    <path
      d={`M${cx} ${cy - r} L${cx + q} ${cy - q} L${cx + r} ${cy} L${cx + q} ${cy + q} L${cx} ${cy + r} L${cx - q} ${cy + q} L${cx - r} ${cy} L${cx - q} ${cy - q} Z`}
      fill={fill}
    />
  );
}

export function BasketIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fbBasket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="fbRim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="fbBag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="fbCoin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Flat ground blob — anchors the basket into the panel (no glow) */}
      <ellipse cx="126" cy="160" rx="98" ry="28" className="fill-blue-100 dark:fill-gray-800" />

      {/* Dashed discovery orbits */}
      <g fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" opacity="0.8">
        <path d="M22 96 Q40 34 108 24" />
        <path d="M152 20 Q212 28 228 74" />
      </g>

      {/* Handle (behind the items) */}
      <path d="M78 100 C78 40 162 40 162 100" fill="none" stroke="url(#fbRim)" strokeWidth="11" strokeLinecap="round" />

      {/* ── Items peeking out of the basket ── */}
      {/* Sneaker */}
      <g>
        <path d="M60 92 Q60 76 74 74 Q84 72 88 80 Q92 87 101 88 L101 93 L60 93 Z" fill="#ffffff" />
        <path d="M74 74 Q84 72 88 80 L80 84 Q75 79 74 74 Z" fill="#bfdbfe" />
        <path d="M64 90 Q78 92 98 89 L101 93 L60 93 Z" fill="#3b82f6" />
        <path d="M68 84 Q76 86 84 82" stroke="#60a5fa" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M60 93 Q58 98 66 99 L96 99 Q103 98 101 93 Z" fill="#1d4ed8" />
      </g>
      {/* Handbag */}
      <g>
        <path d="M108 66 C108 51 130 51 130 66" fill="none" stroke="#db2777" strokeWidth="4" strokeLinecap="round" />
        <rect x="101" y="63" width="36" height="37" rx="9" fill="url(#fbBag)" />
        <rect x="101" y="63" width="36" height="12" rx="6" fill="#f472b6" />
        <circle cx="119" cy="80" r="3" fill="#fff" opacity="0.9" />
      </g>
      {/* Gift box */}
      <g>
        <path d="M157 69 C148 58 143 67 156 70 C169 67 164 58 155 69 Z" fill="#2563eb" />
        <rect x="140" y="69" width="34" height="31" rx="4" fill="#ffffff" />
        <rect x="140" y="69" width="34" height="8" rx="4" fill="#eff6ff" />
        <rect x="153" y="69" width="7" height="31" fill="#3b82f6" />
      </g>

      {/* ── Basket ── */}
      <rect x="50" y="97" width="140" height="13" rx="6.5" fill="url(#fbRim)" />
      <path d="M56 110 L184 110 L173 172 Q171 180 163 180 L77 180 Q69 180 67 172 Z" fill="url(#fbBasket)" />
      {/* Vent slots */}
      <g fill="#1d4ed8" opacity="0.18">
        {[76, 90, 104, 118, 132, 146, 160].map((x) => (
          <rect key={x} x={x} y="118" width="6" height="46" rx="3" />
        ))}
      </g>

      {/* ── Floating finds ──
          transform-box: fill-box makes the float animation's rotate pivot
          around each item's own centre instead of the SVG origin. */}
      {/* Headphones */}
      <g className="animate-float" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <path d="M186 46 C186 24 222 24 222 46" fill="none" stroke="#3b82f6" strokeWidth="7" strokeLinecap="round" />
        <rect x="180" y="43" width="12" height="17" rx="5" fill="#2563eb" />
        <rect x="216" y="43" width="12" height="17" rx="5" fill="#2563eb" />
        <circle cx="186" cy="51" r="3" fill="#60a5fa" />
        <circle cx="222" cy="51" r="3" fill="#60a5fa" />
      </g>
      {/* Watch */}
      <g className="animate-float-slow" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <rect x="213" y="72" width="10" height="9" rx="3" fill="#1d4ed8" />
        <rect x="213" y="97" width="10" height="9" rx="3" fill="#1d4ed8" />
        <circle cx="218" cy="89" r="11" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
        <path d="M218 89 L218 82 M218 89 L223 89" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Wishlist heart badge */}
      <g className="animate-float-slow" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <rect x="30" y="44" width="26" height="26" rx="8" fill="#f472b6" />
        <path d="M43 52 C41 49 36 50 36 54 C36 57 43 62 43 62 C43 62 50 57 50 54 C50 50 45 49 43 52 Z" fill="#ffffff" />
      </g>
      {/* Coin */}
      <g>
        <circle cx="36" cy="112" r="12" fill="url(#fbCoin)" />
        <path d="M36 105 L37.9 109.4 L42.6 109.7 L39 112.8 L40.2 117.4 L36 114.8 L31.8 117.4 L33 112.8 L29.4 109.7 L34.1 109.4 Z" fill="#fffbeb" />
      </g>

      {/* Sparkles */}
      <Sparkle cx={58} cy={24} r={6} fill="#fbbf24" />
      <Sparkle cx={140} cy={14} r={4} fill="#93c5fd" />
      <Sparkle cx={198} cy={68} r={4} fill="#fbbf24" />
      <Sparkle cx={228} cy={124} r={5} fill="#93c5fd" />
      <Sparkle cx={22} cy={84} r={4} fill="#93c5fd" />
    </svg>
  );
}
