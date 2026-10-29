import React from 'react';

interface RoadDamageShieldLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const RoadDamageShieldLogo: React.FC<RoadDamageShieldLogoProps> = ({
  className = 'w-full h-full',
  showWordmark = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${showWordmark ? 'flex-row' : ''}`}>
      {/* 3D Blue Shield Icon */}
      <svg
        viewBox="0 0 100 105"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="AgroRoad AI Shield Logo"
      >
        <defs>
          <linearGradient id="shieldOuterGrad" x1="50" y1="2" x2="50" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B3E8E" />
            <stop offset="50%" stopColor="#0E58CA" />
            <stop offset="100%" stopColor="#082A66" />
          </linearGradient>
          <linearGradient id="shieldRimGrad" x1="12" y1="12" x2="88" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="45%" stopColor="#2589FF" />
            <stop offset="70%" stopColor="#0052D9" />
            <stop offset="100%" stopColor="#003B99" />
          </linearGradient>
          <linearGradient id="shieldRightFacet" x1="50" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0047BA" />
            <stop offset="100%" stopColor="#002B7A" />
          </linearGradient>
          <linearGradient id="shieldSkyGrad" x1="50" y1="15" x2="50" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4CA9FF" />
            <stop offset="30%" stopColor="#7CC3FF" />
            <stop offset="65%" stopColor="#2585EB" />
            <stop offset="100%" stopColor="#0B2A60" />
          </linearGradient>
          <linearGradient id="roadGrad" x1="50" y1="25" x2="50" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E2A3A" />
            <stop offset="50%" stopColor="#111B28" />
            <stop offset="100%" stopColor="#09101A" />
          </linearGradient>
          <clipPath id="shieldInnerClip">
            <path d="M 50 14 L 84 25 C 84 55, 74 76, 50 93 C 26 76, 16 55, 16 25 Z" />
          </clipPath>
        </defs>

        {/* 1. Outer Dark Shield Base */}
        <path
          d="M 50 4 L 92 18 C 92 58, 80 82, 50 100 C 20 82, 8 58, 8 18 Z"
          fill="url(#shieldOuterGrad)"
        />
        {/* 2. Outer Shield 3D Right Shadow Facet */}
        <path
          d="M 50 4 L 92 18 C 92 58, 80 82, 50 100 L 50 4 Z"
          fill="url(#shieldRightFacet)"
          opacity="0.5"
        />
        {/* 3. Beveled Middle Shield Rim */}
        <path
          d="M 50 9 L 88 22 C 88 56, 77 79, 50 96 C 23 79, 12 56, 12 22 Z"
          fill="url(#shieldRimGrad)"
        />
        {/* 4. Left Rim Specular Highlight */}
        <path
          d="M 50 9 L 12 22 C 12 56, 23 79, 50 96 L 50 92 C 26 76, 16 55, 16 25 L 50 14 Z"
          fill="#5CB4FF"
          opacity="0.75"
        />
        {/* 5. Right Rim Deep Shadow */}
        <path
          d="M 50 9 L 88 22 C 88 56, 77 79, 50 96 L 50 92 C 74 76, 84 55, 84 25 L 50 14 Z"
          fill="#002D80"
          opacity="0.65"
        />

        {/* 6. Shield Interior Field (Clipped) */}
        <g clipPath="url(#shieldInnerClip)">
          {/* Sky / Atmospheric Background */}
          <rect x="10" y="10" width="80" height="90" fill="url(#shieldSkyGrad)" />
          {/* Glowing Horizon Flare */}
          <ellipse cx="50" cy="27" rx="22" ry="7" fill="#E6F4FF" opacity="0.85" />
          <ellipse cx="50" cy="27" rx="10" ry="3.5" fill="#FFFFFF" />
          {/* Asphalt Road converging to horizon vanishing point at (50, 26) */}
          <polygon
            points="50,26 47,26 22,96 78,96 53,26"
            fill="url(#roadGrad)"
          />
          {/* Left White Shoulder Solid Line */}
          <polygon
            points="48.5,26 47.5,26 24,96 27.5,96"
            fill="#FFFFFF"
          />
          {/* Right White Shoulder Solid Line */}
          <polygon
            points="51.5,26 52.5,26 76,96 72.5,96"
            fill="#FFFFFF"
          />
          {/* Center Dashed Lane Markings (vanishing perspective) */}
          <polygon points="49.5,28 50.5,28 50.6,33 49.4,33" fill="#FFFFFF" />
          <polygon points="49.4,36 50.6,36 50.8,43 49.2,43" fill="#FFFFFF" />
          <polygon points="49.2,47 50.8,47 51.1,56 48.9,56" fill="#FFFFFF" />
          <polygon points="49.0,61 51.0,61 51.4,72 48.6,72" fill="#FFFFFF" />
          <polygon points="48.7,78 51.3,78 51.8,94 48.2,94" fill="#FFFFFF" />
          {/* Subdued Road Glare Overlay */}
          <path
            d="M 50 14 L 84 25 L 50 93 Z"
            fill="#FFFFFF"
            opacity="0.08"
          />
        </g>
      </svg>
      {showWordmark && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center text-xl sm:text-2xl font-black tracking-tight gap-1">
            <span className="text-[#091E42]">AgroRoad</span>
            <span className="text-[#0066FF] font-black">AI</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-[#475569] font-medium tracking-normal mt-0.5">
            <span>Smarter Analysis</span>
            <span className="text-[#0066FF] font-bold">|</span>
            <span>Safer Roads</span>
          </div>
        </div>
      )}
    </div>
  );
};
