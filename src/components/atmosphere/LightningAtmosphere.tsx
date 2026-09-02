import React from 'react';

export const LightningAtmosphere: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Ambient Sheet Lightning Glow Flare */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-300/30 via-violet-400/20 to-transparent animate-lightning pointer-events-none" />

      {/* 2. Cloud-Core Illumination Center */}
      <div
        className="absolute top-10 left-1/3 w-[500px] h-[300px] bg-violet-200/25 rounded-full blur-[100px] animate-lightning pointer-events-none"
        style={{ animationDelay: '2s' }}
      />
    </div>
  );
};
