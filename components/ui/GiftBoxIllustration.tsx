export function GiftBoxIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="giftBoxFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="giftLidFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="60" cy="108" rx="34" ry="6" fill="#1e3a8a" opacity="0.12" />
      {/* Box body */}
      <rect x="24" y="52" width="72" height="52" rx="6" fill="url(#giftBoxFace)" />
      {/* Lid */}
      <rect x="18" y="38" width="84" height="20" rx="6" fill="url(#giftLidFace)" />
      {/* Vertical ribbon */}
      <rect x="52" y="38" width="16" height="66" fill="#eef2ff" opacity="0.85" />
      {/* Bow */}
      <path
        d="M60 38 C50 22 32 24 34 34 C36 42 50 40 60 38 Z"
        fill="#818cf8"
      />
      <path
        d="M60 38 C70 22 88 24 86 34 C84 42 70 40 60 38 Z"
        fill="#6366f1"
      />
      <circle cx="60" cy="37" r="6" fill="#4f46e5" />
    </svg>
  );
}
