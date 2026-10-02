import React from 'react';
import { MoonPhaseName } from '../types';

interface MoonIconProps {
  phase: MoonPhaseName;
  illumination: number;
  className?: string;
  size?: number;
}

export const MoonIcon: React.FC<MoonIconProps> = ({
  phase,
  illumination,
  className = '',
  size = 20,
}) => {
  // Render an SVG representing the moon phase with shadow and lit part
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;

  // Simplified visual depiction
  const isFull = phase === 'full_moon';
  const isNew = phase === 'new_moon';
  const isWaxing = phase.includes('waxing') || phase === 'first_quarter';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`inline-block ${className}`}
    >
      <title>{`${illumination}% illuminazione`}</title>
      {/* Background dark circle */}
      <circle cx={cx} cy={cy} r={r} fill="#1e293b" stroke="#475569" strokeWidth="1" />

      {isFull ? (
        <circle cx={cx} cy={cy} r={r} fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
      ) : isNew ? (
        <circle cx={cx} cy={cy} r={r} fill="#0f172a" stroke="#334155" strokeWidth="1" />
      ) : (
        // Half / crescent lit portion
        <g>
          <clipPath id={`moon-clip-${size}-${phase}`}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
          <rect
            x={isWaxing ? cx : cx - r}
            y={cy - r}
            width={r}
            height={r * 2}
            fill="#fef08a"
            clipPath={`url(#moon-clip-${size}-${phase})`}
          />
          {/* Inner ellipse to shape crescent / gibbous */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={Math.abs(r * (illumination - 50) / 50)}
            ry={r}
            fill={illumination > 50 ? '#fef08a' : '#1e293b'}
          />
        </g>
      )}
    </svg>
  );
};
