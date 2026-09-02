import React from 'react';

interface MoonAtmosphereProps {
  phase?: 'crescent' | 'gibbous' | 'full';
}

export const MoonAtmosphere: React.FC<MoonAtmosphereProps> = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Broad Lunar Atmosphere Glow */}
      <div className="absolute top-8 right-8 sm:right-24 w-[420px] h-[420px] bg-sky-300/12 rounded-full blur-[100px] animate-sun-pulse" />
      <div className="absolute top-16 right-12 sm:right-28 w-[240px] h-[240px] bg-indigo-300/15 rounded-full blur-[60px]" />

      {/* 2. Floating Moon Body */}
      <div className="absolute top-14 right-10 sm:right-28 w-24 h-24 sm:w-28 sm:h-28 animate-moon-float">
        {/* Outer Lunar Halo Ring */}
        <div className="absolute inset-0 rounded-full border border-sky-200/20 shadow-[0_0_50px_rgba(186,230,253,0.35)] scale-125" />

        {/* Realistic SVG Moon Body */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_24px_rgba(224,242,254,0.7)]">
          <defs>
            <radialGradient id="moonGlowGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#E0F2FE" />
              <stop offset="85%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#7DD3FC" />
            </radialGradient>

            {/* Crater Texture Filter */}
            <radialGradient id="craterGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#64748B" stopOpacity="0.1" />
            </radialGradient>
          </defs>

          {/* Moon Sphere */}
          <circle cx="50" cy="50" r="46" fill="url(#moonGlowGrad)" />

          {/* Lunar Maria (Subtle surface topography) */}
          <ellipse cx="40" cy="38" rx="14" ry="12" fill="url(#craterGrad)" />
          <ellipse cx="64" cy="46" rx="10" ry="15" fill="url(#craterGrad)" />
          <circle cx="36" cy="62" r="9" fill="url(#craterGrad)" />
          <circle cx="58" cy="68" r="7" fill="url(#craterGrad)" />
          <circle cx="52" cy="32" r="5" fill="url(#craterGrad)" />

          {/* Soft Crescent Shading on dark limb */}
          <path
            d="M 50,4 A 46,46 0 0,1 96,50 A 46,46 0 0,1 50,96 A 46,38 0 0,0 50,4 Z"
            fill="#0F172A"
            fillOpacity="0.32"
          />
        </svg>

        {/* Ambient Moonbeam Sheen */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-20 bg-sky-200/10 rounded-full blur-xl pointer-events-none" />
      </div>
    </div>
  );
};
