import React from 'react';

interface SunAtmosphereProps {
  variant?: 'high' | 'sunrise' | 'sunset';
}

export const SunAtmosphere: React.FC<SunAtmosphereProps> = ({ variant = 'high' }) => {
  const isSunrise = variant === 'sunrise';
  const isSunset = variant === 'sunset';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Deep Core Solar Corona & Radial Aura */}
      {variant === 'high' && (
        <>
          {/* Broad Sky Ambient Glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[550px] bg-sky-400/20 rounded-full blur-[130px] animate-sun-pulse" />
          
          {/* Warm Core Sun Halo */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-amber-300/25 rounded-full blur-[80px]" />
          
          {/* Inner Golden Core */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[180px] h-[180px] bg-amber-100/35 rounded-full blur-[40px]" />
          
          {/* Sun Disk & Subtle Rays */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-28 h-28 flex items-center justify-center">
            {/* Atmospheric Rotating Light Rays */}
            <div className="absolute w-[440px] h-[440px] animate-sun-rays opacity-25">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  <radialGradient id="sunRayGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
                    <stop offset="40%" stopColor="#FBBF24" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <g fill="url(#sunRayGrad)">
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <polygon
                      key={deg}
                      points="200,200 193,10 207,10"
                      transform={`rotate(${deg} 200 200)`}
                    />
                  ))}
                </g>
              </svg>
            </div>

            {/* Glowing Sun Orb */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.8)] border border-amber-100/60" />
          </div>

          {/* Natural Lens Flare Diffraction Ring (Subtle) */}
          <div className="absolute top-44 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full border border-sky-300/10 opacity-40 pointer-events-none" />
        </>
      )}

      {/* Sunrise Sun Variant (Lower Horizon, Golden-Apricot) */}
      {isSunrise && (
        <>
          <div className="absolute top-44 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-orange-500/25 rounded-full blur-[110px] animate-sun-pulse" />
          <div className="absolute top-60 left-1/2 -translate-x-1/2 w-[380px] h-[260px] bg-amber-400/30 rounded-full blur-[70px]" />
          
          <div className="absolute top-64 left-1/2 -translate-x-1/2 w-32 h-32 flex items-center justify-center">
            {/* Sunrise Fan Rays */}
            <div className="absolute w-[500px] h-[500px] animate-sun-rays opacity-30">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  <radialGradient id="sunriseRayGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#FB923C" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <g fill="url(#sunriseRayGrad)">
                  {[0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336].map((deg) => (
                    <polygon
                      key={deg}
                      points="200,200 194,20 206,20"
                      transform={`rotate(${deg} 200 200)`}
                    />
                  ))}
                </g>
              </svg>
            </div>

            {/* Rising Sun Disk */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 via-orange-300 to-rose-400 shadow-[0_0_80px_rgba(251,146,60,0.9)] border border-amber-200/60" />
          </div>
        </>
      )}

      {/* Sunset Sun Variant (Deep Coral & Golden Twilight) */}
      {isSunset && (
        <>
          <div className="absolute top-52 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-rose-600/25 rounded-full blur-[120px] animate-sun-pulse" />
          <div className="absolute top-64 left-1/2 -translate-x-1/2 w-[420px] h-[300px] bg-amber-500/30 rounded-full blur-[80px]" />
          
          <div className="absolute top-72 left-1/2 -translate-x-1/2 w-32 h-32 flex items-center justify-center">
            {/* Setting Sun Rays */}
            <div className="absolute w-[500px] h-[500px] animate-sun-rays opacity-25">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  <radialGradient id="sunsetRayGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FECDD3" stopOpacity="0.9" />
                    <stop offset="45%" stopColor="#F43F5E" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#881337" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <g fill="url(#sunsetRayGrad)">
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <polygon
                      key={deg}
                      points="200,200 193,15 207,15"
                      transform={`rotate(${deg} 200 200)`}
                    />
                  ))}
                </g>
              </svg>
            </div>

            {/* Sinking Sun Disk */}
            <div className="w-22 h-22 rounded-full bg-gradient-to-br from-amber-200 via-orange-400 to-rose-600 shadow-[0_0_90px_rgba(244,63,94,0.85)] border border-orange-200/50" />
          </div>
        </>
      )}
    </div>
  );
};
