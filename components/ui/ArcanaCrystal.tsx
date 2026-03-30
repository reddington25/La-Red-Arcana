import React from 'react';

interface ArcanaCrystalProps {
  className?: string;
  size?: number;
}

export function ArcanaCrystal({ className = "", size = 20 }: ArcanaCrystalProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      className={`inline-block ${className}`}
      fill="none"
    >
      <path 
        d="M12 2L2 12L12 22L22 12L12 2Z" 
        fill="url(#crystalGradient)" 
        stroke="#8B0000" 
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path 
        d="M12 2v20m-10-10h20m-15-5l10 10m-10 0l10-10" 
        stroke="#FFFFFF" 
        strokeOpacity="0.3" 
        strokeWidth="1"
      />
      <defs>
        <linearGradient id="crystalGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DC143C" />
          <stop offset="50%" stopColor="#8B0000" />
          <stop offset="100%" stopColor="#4A0000" />
        </linearGradient>
      </defs>
    </svg>
  );
}
