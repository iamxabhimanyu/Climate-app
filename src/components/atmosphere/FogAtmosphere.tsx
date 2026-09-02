import React from 'react';

export const FogAtmosphere: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Low Horizon Dense Fog Layer */}
      <div className="absolute -bottom-10 inset-x-0 h-96 bg-gradient-to-t from-slate-600/25 via-slate-500/15 to-transparent animate-mist" />
      
      {/* 2. Mid Atmospheric Drifting Haze Bank */}
      <div
        className="absolute top-1/4 -left-10 w-[120%] h-64 bg-slate-400/10 rounded-full blur-[80px] animate-mist"
        style={{ animationDuration: '24s', animationDelay: '3s' }}
      />
      
      {/* 3. Upper Diffused Atmospheric Veil */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-slate-400/10 to-transparent pointer-events-none" />
    </div>
  );
};
