export function PharmacyHeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 480" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="240" cy="240" r="200" fill="white" fillOpacity="0.04" />
      <circle cx="240" cy="240" r="140" fill="white" fillOpacity="0.03" />

      {/* Medicine bottle */}
      <g transform="translate(160, 100)">
        <rect x="20" y="30" width="80" height="130" rx="14" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" />
        <rect x="30" y="15" width="60" height="24" rx="8" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" />
        <rect x="35" y="60" width="50" height="6" rx="3" fill="white" fillOpacity="0.15" />
        <rect x="40" y="74" width="35" height="4" rx="2" fill="white" fillOpacity="0.1" />
        <rect x="50" y="100" width="20" height="36" rx="4" fill="white" fillOpacity="0.18" />
        <rect x="42" y="110" width="36" height="16" rx="4" fill="white" fillOpacity="0.18" />
      </g>

      {/* Capsule 1 */}
      <g transform="translate(300, 150) rotate(-25)">
        <rect width="70" height="28" rx="14" fill="#818CF8" fillOpacity="0.35" />
        <rect width="35" height="28" rx="14" fill="#A78BFA" fillOpacity="0.4" />
      </g>

      {/* Capsule 2 */}
      <g transform="translate(100, 280) rotate(15)">
        <rect width="60" height="24" rx="12" fill="#34D399" fillOpacity="0.3" />
        <rect width="30" height="24" rx="12" fill="#6EE7B7" fillOpacity="0.35" />
      </g>

      {/* Pill */}
      <circle cx="340" cy="300" r="20" fill="#F472B6" fillOpacity="0.25" stroke="#F472B6" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="325" y1="300" x2="355" y2="300" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />

      {/* Stethoscope */}
      <g transform="translate(280, 200)">
        <path d="M0 0 C0 50 30 80 60 80" stroke="white" strokeOpacity="0.15" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M0 0 C0 50 -30 80 -60 80" stroke="white" strokeOpacity="0.15" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="0" cy="0" r="6" fill="white" fillOpacity="0.15" />
        <path d="M-60 80 C-60 110 -30 130 0 130" stroke="white" strokeOpacity="0.12" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="0" cy="135" r="14" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.18" strokeWidth="2" />
      </g>

      {/* Heartbeat line */}
      <path d="M80 360 L120 360 L135 340 L150 380 L165 320 L180 370 L195 360 L400 360" stroke="white" strokeOpacity="0.1" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Floating circles */}
      <circle cx="100" cy="140" r="6" fill="#818CF8" fillOpacity="0.35" className="animate-float" />
      <circle cx="380" cy="120" r="4" fill="#34D399" fillOpacity="0.4" className="animate-float" style={{ animationDelay: "1s" }} />
      <circle cx="370" cy="370" r="5" fill="#F472B6" fillOpacity="0.3" className="animate-float" style={{ animationDelay: "2s" }} />
      <circle cx="130" cy="360" r="3" fill="#60A5FA" fillOpacity="0.4" className="animate-float" style={{ animationDelay: "0.5s" }} />
      <circle cx="400" cy="240" r="7" fill="#FBBF24" fillOpacity="0.25" className="animate-float" style={{ animationDelay: "1.5s" }} />

      {/* DNA helix suggestion */}
      <g transform="translate(80, 180)" opacity="0.12">
        <path d="M0 0 Q15 20 0 40 Q-15 60 0 80 Q15 100 0 120" stroke="white" strokeWidth="2" fill="none" />
        <path d="M25 0 Q10 20 25 40 Q40 60 25 80 Q10 100 25 120" stroke="white" strokeWidth="2" fill="none" />
        <line x1="5" y1="10" x2="20" y2="10" stroke="white" strokeWidth="1" />
        <line x1="2" y1="40" x2="23" y2="40" stroke="white" strokeWidth="1" />
        <line x1="5" y1="70" x2="20" y2="70" stroke="white" strokeWidth="1" />
        <line x1="2" y1="100" x2="23" y2="100" stroke="white" strokeWidth="1" />
      </g>
    </svg>
  );
}

export function EmptyStateIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="30" width="100" height="90" rx="16" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1.5" />
      <rect x="65" y="55" width="70" height="6" rx="3" fill="#C7D2FE" />
      <rect x="65" y="68" width="50" height="6" rx="3" fill="#E0E7FF" />
      <rect x="65" y="81" width="60" height="6" rx="3" fill="#E0E7FF" />
      <circle cx="100" cy="40" r="14" fill="#6366F1" fillOpacity="0.15" stroke="#818CF8" strokeWidth="1.5" />
      <path d="M95 40 L100 45 L108 36" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="155" cy="55" r="8" fill="#34D399" fillOpacity="0.2" />
      <circle cx="40" cy="80" r="6" fill="#F472B6" fillOpacity="0.2" />
      <circle cx="165" cy="100" r="4" fill="#FBBF24" fillOpacity="0.3" />
    </svg>
  );
}

export function MedicalLogo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="12" fill="url(#logo-gradient)" />
      <rect x="16" y="10" width="8" height="20" rx="2" fill="white" />
      <rect x="10" y="16" width="20" height="8" rx="2" fill="white" />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
