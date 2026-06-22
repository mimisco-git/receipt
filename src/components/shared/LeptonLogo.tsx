// Lepton coin SVG - the Greek lepton, the smallest coin
// Used wherever "Lepton" is mentioned on the site
export default function LeptonLogo({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      {/* Coin body */}
      <circle cx="50" cy="50" r="48" fill="#C4843A" />
      <circle cx="50" cy="50" r="48" fill="url(#coin-grad)" />
      {/* Outer rim dots */}
      <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1"
        strokeDasharray="2 4.5" strokeLinecap="round" />
      {/* Inner wreath circle */}
      <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      {/* "1" numeral */}
      <rect x="46" y="18" width="8" height="22" rx="1" fill="rgba(0,0,0,0.45)" />
      {/* LEPTON text */}
      <text x="50" y="68" textAnchor="middle" fontFamily="serif" fontSize="13"
        fontWeight="bold" fill="rgba(0,0,0,0.55)" letterSpacing="1">
        LEPTON
      </text>
      {/* Laurel branches simplified */}
      <path d="M18 55 Q25 40 35 48 Q28 52 22 62 Z" fill="rgba(0,0,0,0.2)" />
      <path d="M82 55 Q75 40 65 48 Q72 52 78 62 Z" fill="rgba(0,0,0,0.2)" />
      <path d="M18 65 Q26 55 34 60 Q27 66 20 72 Z" fill="rgba(0,0,0,0.15)" />
      <path d="M82 65 Q74 55 66 60 Q73 66 80 72 Z" fill="rgba(0,0,0,0.15)" />
      {/* Crown at bottom */}
      <path d="M42 80 Q50 75 58 80 Q54 85 50 87 Q46 85 42 80 Z" fill="rgba(0,0,0,0.2)" />
      <defs>
        <radialGradient id="coin-grad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="rgba(255,200,100,0.35)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </radialGradient>
      </defs>
    </svg>
  );
}
