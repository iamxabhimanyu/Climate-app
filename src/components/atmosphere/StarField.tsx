import React, { useMemo } from 'react';

interface StarFieldProps {
  density?: 'sparse' | 'normal' | 'dense';
}

export const StarField: React.FC<StarFieldProps> = ({ density = 'normal' }) => {
  const starsCount = density === 'sparse' ? 24 : density === 'dense' ? 60 : 42;

  // Generate deterministic stars
  const stars = useMemo(() => {
    const list = [];
    for (let i = 0; i < starsCount; i++) {
      const top = (Math.sin(i * 997) * 0.5 + 0.5) * 55; // Upper 55% of screen
      const left = (Math.cos(i * 733) * 0.5 + 0.5) * 96 + 2; // 2% to 98%
      const size = (i % 5 === 0) ? 2.5 : (i % 3 === 0) ? 1.8 : 1.2;
      const duration = 2.5 + (i % 7) * 0.8;
      const delay = (i % 11) * 0.4;
      const opacity = 0.3 + (i % 5) * 0.15;
      const isBlue = i % 4 === 0;

      list.push({ id: i, top, left, size, duration, delay, opacity, isBlue });
    }
    return list;
  }, [starsCount]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.isBlue ? '#BAE6FD' : '#FFFFFF',
            boxShadow: `0 0 ${star.size * 2}px ${star.isBlue ? '#7DD3FC' : '#FFFFFF'}`,
            opacity: star.opacity,
            animation: `starTwinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}

      {/* Occasional Subtle Shooting Star / Meteor Trail */}
      <div
        className="absolute w-24 h-[1.5px] bg-gradient-to-l from-transparent via-sky-200 to-white"
        style={{
          top: '18%',
          right: '15%',
          transform: 'rotate(-38deg)',
          animation: 'meteorShoot 22s ease-in infinite 6s',
          filter: 'drop-shadow(0 0 4px #BAE6FD)',
        }}
      />
    </div>
  );
};
