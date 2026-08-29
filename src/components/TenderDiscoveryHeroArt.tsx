/** Decorative illustration for Opportunities header (matches reference mock). */
export function TenderDiscoveryHeroArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="200" cy="40" r="60" fill="url(#g1)" opacity="0.5" />
      <circle cx="60" cy="140" r="50" fill="url(#g2)" opacity="0.35" />

      {/* Document */}
      <rect x="118" y="48" width="88" height="108" rx="12" fill="white" stroke="#c7d2fe" strokeWidth="2" />
      <rect x="132" y="68" width="48" height="6" rx="3" fill="#e0e7ff" />
      <rect x="132" y="84" width="60" height="6" rx="3" fill="#e0e7ff" />
      <rect x="132" y="100" width="40" height="6" rx="3" fill="#e0e7ff" />

      {/* Bars */}
      <rect x="136" y="122" width="10" height="22" rx="3" fill="#93c5fd" />
      <rect x="152" y="112" width="10" height="32" rx="3" fill="#6366f1" />
      <rect x="168" y="118" width="10" height="26" rx="3" fill="#a5b4fc" />

      {/* Magnifier */}
      <circle cx="95" cy="95" r="28" fill="white" stroke="#818cf8" strokeWidth="4" />
      <circle cx="95" cy="95" r="16" fill="#eef2ff" stroke="#a5b4fc" strokeWidth="2" />
      <rect
        x="112"
        y="118"
        width="8"
        height="28"
        rx="4"
        fill="#6366f1"
        transform="rotate(-40 112 118)"
      />

      <defs>
        <linearGradient id="g1" x1="160" y1="0" x2="260" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c7d2fe" />
          <stop offset="1" stopColor="#e0e7ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="g2" x1="20" y1="100" x2="110" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ddd6fe" />
          <stop offset="1" stopColor="#f5f3ff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
