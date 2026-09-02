import React, { useMemo } from 'react';

export const SnowAtmosphere: React.FC = () => {
  const count = 30;

  const flakes = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const left = (i / count) * 100 + (Math.sin(i * 41) * 3);
      const size = 3 + (i % 4) * 2;
      const duration = 4.5 + (i % 5) * 1.2;
      const delay = (i % 10) * 0.4;
      const opacity = 0.4 + (i % 4) * 0.15;

      list.push({ id: i, left, size, duration, delay, opacity });
    }
    return list;
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            left: `${flake.left}%`,
            top: '-20px',
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowFallAnimation ${flake.duration}s ease-in-out ${flake.delay}s infinite`,
          }}
        />
      ))}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-sky-900/15 to-transparent pointer-events-none" />
    </div>
  );
};
