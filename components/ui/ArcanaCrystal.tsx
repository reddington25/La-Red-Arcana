import React from 'react';

interface ArcanaCrystalProps {
  className?: string;
  size?: number;
}

export function ArcanaCrystal({ className = "", size = 20 }: ArcanaCrystalProps) {
  const gradientId = `crystalGrad_${size}`;
  const glowId = `crystalGlow_${size}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`inline-block drop-shadow-sm ${className}`}
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF2D5B" />
          <stop offset="40%" stopColor="#C0003A" />
          <stop offset="100%" stopColor="#5A0015" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Main diamond body */}
      <path
        d="M12 2L2 12L12 22L22 12Z"
        fill={`url(#${gradientId})`}
        stroke="#FF2D5B"
        strokeWidth="0.5"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />
      {/* Top facet highlight */}
      <path
        d="M12 2L2 12L12 9Z"
        fill="rgba(255,255,255,0.18)"
      />
      {/* Left facet */}
      <path
        d="M12 2L12 9L7 12Z"
        fill="rgba(255,255,255,0.08)"
      />
      {/* Right facet */}
      <path
        d="M12 2L17 12L22 12Z"
        fill="rgba(0,0,0,0.2)"
      />
      {/* Center shine */}
      <line x1="12" y1="4" x2="12" y2="10" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

interface ArcanasBadgeProps {
  amount: number;
  className?: string;
}

/** Full badge pill with crystal icon + "Arcanas" label */
export function ArcanasBadge({ amount, className = "" }: ArcanasBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold
        bg-gradient-to-r from-red-950/80 to-black/80
        border border-red-700/60
        shadow-[0_0_8px_rgba(180,0,30,0.4)]
        text-red-100
        backdrop-blur
        ${className}`}
    >
      <ArcanaCrystal size={16} />
      <span className="tabular-nums">{amount}</span>
      <span className="text-red-300/80 font-normal text-xs">Arcanas</span>
    </span>
  );
}
