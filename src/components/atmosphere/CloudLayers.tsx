import React from 'react';

interface CloudLayersProps {
  coverage?: 'none' | 'light' | 'moderate' | 'heavy' | 'storm';
  tone?: 'bright' | 'golden' | 'dusk' | 'slate' | 'night' | 'storm';
}

export const CloudLayers: React.FC<CloudLayersProps> = ({
  coverage = 'moderate',
  tone = 'bright',
}) => {
  if (coverage === 'none') return null;

  // Derive gradient fills based on cloud tone
  const getGradients = () => {
    switch (tone) {
      case 'golden': // Sunrise
        return {
          back: 'linear-gradient(180deg, rgba(251, 146, 60, 0.28) 0%, rgba(217, 119, 6, 0.08) 100%)',
          front: 'linear-gradient(180deg, rgba(254, 215, 170, 0.35) 0%, rgba(249, 115, 22, 0.12) 100%)',
          filter: 'drop-shadow(0 8px 24px rgba(234, 88, 12, 0.15))',
        };
      case 'dusk': // Sunset
        return {
          back: 'linear-gradient(180deg, rgba(168, 85, 247, 0.25) 0%, rgba(244, 63, 94, 0.1) 100%)',
          front: 'linear-gradient(180deg, rgba(251, 113, 133, 0.32) 0%, rgba(147, 51, 234, 0.12) 100%)',
          filter: 'drop-shadow(0 8px 24px rgba(219, 39, 119, 0.15))',
        };
      case 'slate': // Overcast / Rain
        return {
          back: 'linear-gradient(180deg, rgba(100, 116, 139, 0.3) 0%, rgba(51, 65, 85, 0.08) 100%)',
          front: 'linear-gradient(180deg, rgba(148, 163, 184, 0.35) 0%, rgba(71, 85, 105, 0.15) 100%)',
          filter: 'drop-shadow(0 10px 30px rgba(15, 23, 42, 0.25))',
        };
      case 'night': // Nocturnal clouds
        return {
          back: 'linear-gradient(180deg, rgba(30, 41, 59, 0.35) 0%, rgba(15, 23, 42, 0.08) 100%)',
          front: 'linear-gradient(180deg, rgba(51, 65, 85, 0.38) 0%, rgba(15, 23, 42, 0.12) 100%)',
          filter: 'drop-shadow(0 8px 24px rgba(2, 6, 23, 0.4))',
        };
      case 'storm': // Thunderstorm
        return {
          back: 'linear-gradient(180deg, rgba(30, 27, 75, 0.65) 0%, rgba(15, 23, 42, 0.2) 100%)',
          front: 'linear-gradient(180deg, rgba(51, 45, 95, 0.6) 0%, rgba(15, 23, 42, 0.3) 100%)',
          filter: 'drop-shadow(0 12px 36px rgba(0, 0, 0, 0.6))',
        };
      case 'bright':
      default: // Sunny daytime
        return {
          back: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(224, 242, 254, 0.06) 100%)',
          front: 'linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(186, 230, 253, 0.1) 100%)',
          filter: 'drop-shadow(0 8px 20px rgba(186, 230, 253, 0.15))',
        };
    }
  };

  const style = getGradients();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Deep Parallax Back Cloud Layer (Drifts slowly) */}
      <div
        className="absolute -top-10 -left-1/4 w-[150%] h-[360px] animate-cloud-slow opacity-80"
        style={{ filter: style.filter }}
      >
        <svg viewBox="0 0 1200 400" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <path
            d="M0,220 Q180,110 360,180 T720,140 T1080,190 T1200,160 L1200,400 L0,400 Z"
            fill={style.back}
          />
          <path
            d="M0,280 Q220,190 480,240 T920,210 T1200,260 L1200,400 L0,400 Z"
            fill={style.back}
            opacity="0.7"
          />
        </svg>
      </div>

      {/* 2. Mid/Front Parallax Cloud Layer (Drifts in counter-pace) */}
      {(coverage === 'moderate' || coverage === 'heavy' || coverage === 'storm') && (
        <div
          className="absolute top-12 -left-1/3 w-[160%] h-[320px] animate-cloud-medium"
          style={{ filter: style.filter }}
        >
          <svg viewBox="0 0 1200 350" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,170 Q160,80 320,130 Q460,50 620,110 Q780,40 940,120 Q1100,70 1200,140 L1200,350 L0,350 Z"
              fill={style.front}
            />
          </svg>
        </div>
      )}

      {/* 3. Upper Storm Shelf Cumulus (For heavy overcast and storms) */}
      {(coverage === 'heavy' || coverage === 'storm') && (
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-slate-950/60 to-transparent pointer-events-none" />
      )}
    </div>
  );
};
