export function PlantIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      {/* Pot */}
      <path d="M28 58 L52 58 L48 74 L32 74 Z" fill="#6366f1" />
      <rect x="26" y="52" width="28" height="8" rx="3" fill="#4f46e5" />
      {/* Stem */}
      <path d="M40 52 C40 40 40 34 40 26" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Leaves */}
      <path d="M40 40 C30 34 26 22 34 16 C40 24 42 32 40 40 Z" fill="#4ade80" />
      <path d="M40 34 C50 28 54 16 46 10 C40 18 38 26 40 34 Z" fill="#22c55e" />
      <path d="M40 46 C32 42 26 34 32 30 C38 34 40 40 40 46 Z" fill="#86efac" />
    </svg>
  );
}
