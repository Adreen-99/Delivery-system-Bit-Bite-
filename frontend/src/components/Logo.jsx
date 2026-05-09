export default function Logo({ size = 32, showText = true }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>

        <circle cx="32" cy="32" r="30" fill="url(#logo-grad)" />

        <circle cx="32" cy="32" r="30" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3" />

        <circle cx="48" cy="16" r="11" fill="#0f172a" />
        <circle cx="48" cy="16" r="8" fill="url(#logo-grad)" />

        <g transform="translate(32, 32)">
          <rect x="-10" y="-14" width="20" height="28" rx="4" fill="white" opacity="0.15" />
          <text x="0" y="5" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial">₿</text>
        </g>
      </svg>
      {showText && (
        <span className="text-xl font-bold tracking-tight">
          <span className="text-orange-600">Bit</span>
          <span className="text-gray-900 dark:text-white">Bite</span>
        </span>
      )}
    </div>
  )
}
