import React, { useMemo } from 'react';

interface RainAtmosphereProps {
  intensity?: 'light' | 'heavy';
}

export const RainAtmosphere: React.FC<RainAtmosphereProps> = ({ intensity = 'light' }) => {
  const count = intensity === 'heavy' ? 48 : 26;

  // Generate deterministic raindrops with varied lengths, speeds, and positions
  const drops = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const left = (i / count) * 100 + (Math.sin(i * 37) * 2);
      const height = intensity === 'heavy' ? 32 + (i % 5) * 8 : 20 + (i % 4) * 6;
      const duration = intensity === 'heavy' ? 0.75 + (i % 4) * 0.15 : 1.1 + (i % 5) * 0.2;
      const delay = (i % 12) * 0.12;
      const opacity = intensity === 'heavy' ? 0.45 + (i % 4) * 0.12 : 0.28 + (i % 3) * 0.1;
      const isForeground = i % 3 === 0;

      list.push({ id: i, left, height, duration, delay, opacity, isForeground });
    }
    return list;
  }, [count, intensity]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Rain Streak Layer with slight natural wind angle */}
      <div className="absolute inset-0 transform -rotate-[10deg] scale-110">
        {drops.map((drop) => (
          <div
            key={drop.id}
            className="absolute rounded-full"
            style={{
              left: `${drop.left}%`,
              top: '-80px',
              width: drop.isForeground ? '1.5px' : '1px',
              height: `${drop.height}px`,
              background: 'linear-gradient(to bottom, transparent, rgba(186, 230, 253, 0.45), rgba(255, 255, 255, 0.85))',
              opacity: drop.opacity,
              animation: `rainFallAnimation ${drop.duration}s linear ${drop.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Atmospheric Ground Mist & Wet Surface Sheen */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-sky-950/20 via-sky-900/5 to-transparent pointer-events-none" />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[120px] bg-sky-400/8 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
