import React from 'react';

interface BikeLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emerald' | 'slate' | 'white';
  showRoad?: boolean;
  label?: string;
  className?: string;
}

const DIMENSIONS: Record<'sm' | 'md' | 'lg' | 'xl', { width: number; height: number }> = {
  sm: { width: 44, height: 26 },
  md: { width: 76, height: 45 },
  lg: { width: 110, height: 65 },
  xl: { width: 150, height: 90 }
};

const COLOR_THEMES = {
  emerald: {
    frame: '#059669', // emerald-600
    accent: '#10b981', // emerald-500
    tire: '#0f172a', // slate-900 rubber
    spoke: '#64748b', // slate-500
    road: '#94a3b8', // slate-400
    glow: 'rgba(16, 185, 129, 0.15)'
  },
  slate: {
    frame: '#334155', // slate-700
    accent: '#64748b', // slate-500
    tire: '#0f172a',
    spoke: '#94a3b8',
    road: '#cbd5e1',
    glow: 'rgba(100, 116, 139, 0.12)'
  },
  white: {
    frame: '#ffffff',
    accent: '#f1f5f9',
    tire: '#e2e8f0',
    spoke: '#cbd5e1',
    road: '#94a3b8',
    glow: 'rgba(255, 255, 255, 0.2)'
  }
};

export const BikeLoadingSpinner: React.FC<BikeLoadingSpinnerProps> = ({
  size = 'md',
  variant = 'emerald',
  showRoad = true,
  label,
  className = ''
}) => {
  const dimensions = DIMENSIONS[size] || DIMENSIONS.md;
  const colorMap = COLOR_THEMES[variant] || COLOR_THEMES.emerald;

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 110 66"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible select-none drop-shadow-xs"
        aria-label="Fahrrad lädt..."
      >
        <defs>
          <linearGradient id={`frameGrad-${variant}`} x1="25" y1="20" x2="85" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={colorMap.frame} />
            <stop offset="100%" stopColor={colorMap.accent} />
          </linearGradient>
          <filter id={`softGlow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor={colorMap.glow} />
          </filter>
        </defs>

        {/* Dynamic Road / Ground dashes moving backwards underneath */}
        {showRoad && (
          <g opacity="0.6">
            <line
              x1="2"
              y1="61"
              x2="108"
              y2="61"
              stroke={colorMap.road}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="6 7"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-26" dur="0.45s" repeatCount="indefinite" />
            </line>
            {/* Secondary faint motion dust streaks behind rear wheel */}
            <line
              x1="2"
              y1="46"
              x2="14"
              y2="46"
              stroke={colorMap.road}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="3 4"
              opacity="0.5"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="0.35s" repeatCount="indefinite" />
            </line>
          </g>
        )}

        {/* Bicycle Chassis with subtle road bounce animation */}
        <g filter={`url(#softGlow-${variant})`}>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-1.2; 0,0"
            dur="0.55s"
            repeatCount="indefinite"
          />

          {/* === REAR WHEEL (Center at 25, 44; Radius 15) with MOVING TIRES === */}
          <g id="rear-wheel">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 25 44"
              to="360 25 44"
              dur="0.75s"
              repeatCount="indefinite"
            />
            {/* Outer Rubber Tire */}
            <circle cx="25" cy="44" r="15" stroke={colorMap.tire} strokeWidth="3" fill="none" />
            {/* Tire Tread Pattern */}
            <circle
              cx="25"
              cy="44"
              r="14.8"
              stroke={colorMap.accent}
              strokeWidth="1.2"
              strokeDasharray="3.5 3.5"
              opacity="0.85"
              fill="none"
            />
            {/* Inner Aluminum Rim */}
            <circle cx="25" cy="44" r="12.5" stroke="#94a3b8" strokeWidth="1" opacity="0.7" fill="none" />
            
            {/* Rotating Spokes (8 radial spokes) */}
            <line x1="12" y1="44" x2="38" y2="44" stroke={colorMap.spoke} strokeWidth="1" />
            <line x1="25" y1="31" x2="25" y2="57" stroke={colorMap.spoke} strokeWidth="1" />
            <line x1="15.8" y1="34.8" x2="34.2" y2="53.2" stroke={colorMap.spoke} strokeWidth="1" />
            <line x1="15.8" y1="53.2" x2="34.2" y2="34.8" stroke={colorMap.spoke} strokeWidth="1" />

            {/* Valve Stem indicator */}
            <rect x="24.2" y="30.5" width="1.6" height="3" rx="0.5" fill="#f59e0b" />
            {/* Center Axle Hub */}
            <circle cx="25" cy="44" r="2.8" fill={colorMap.tire} />
            <circle cx="25" cy="44" r="1.2" fill="#ffffff" />
          </g>

          {/* === FRONT WHEEL (Center at 85, 44; Radius 15) with MOVING TIRES === */}
          <g id="front-wheel">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 85 44"
              to="360 85 44"
              dur="0.75s"
              repeatCount="indefinite"
            />
            {/* Outer Rubber Tire */}
            <circle cx="85" cy="44" r="15" stroke={colorMap.tire} strokeWidth="3" fill="none" />
            {/* Tire Tread Pattern */}
            <circle
              cx="85"
              cy="44"
              r="14.8"
              stroke={colorMap.accent}
              strokeWidth="1.2"
              strokeDasharray="3.5 3.5"
              opacity="0.85"
              fill="none"
            />
            {/* Inner Aluminum Rim */}
            <circle cx="85" cy="44" r="12.5" stroke="#94a3b8" strokeWidth="1" opacity="0.7" fill="none" />
            
            {/* Rotating Spokes (8 radial spokes) */}
            <line x1="72" y1="44" x2="98" y2="44" stroke={colorMap.spoke} strokeWidth="1" />
            <line x1="85" y1="31" x2="85" y2="57" stroke={colorMap.spoke} strokeWidth="1" />
            <line x1="75.8" y1="34.8" x2="94.2" y2="53.2" stroke={colorMap.spoke} strokeWidth="1" />
            <line x1="75.8" y1="53.2" x2="94.2" y2="34.8" stroke={colorMap.spoke} strokeWidth="1" />

            {/* Valve Stem indicator */}
            <rect x="84.2" y="30.5" width="1.6" height="3" rx="0.5" fill="#f59e0b" />
            {/* Center Axle Hub */}
            <circle cx="85" cy="44" r="2.8" fill={colorMap.tire} />
            <circle cx="85" cy="44" r="1.2" fill="#ffffff" />
          </g>

          {/* === BICYCLE FRAMEWORK === */}
          <g strokeLinecap="round" strokeLinejoin="round">
            {/* Chainstay (rear axle to bottom bracket) */}
            <line x1="25" y1="44" x2="52" y2="44" stroke={`url(#frameGrad-${variant})`} strokeWidth="3.2" />
            
            {/* Seatstay (rear axle to seat tube joint) */}
            <line x1="25" y1="44" x2="45" y2="23" stroke={`url(#frameGrad-${variant})`} strokeWidth="2.8" />
            
            {/* Seat Tube (bottom bracket up to seat post clamp) */}
            <line x1="52" y1="44" x2="44" y2="21" stroke={`url(#frameGrad-${variant})`} strokeWidth="3.4" />
            
            {/* Down Tube (bottom bracket to head tube) */}
            <line x1="52" y1="44" x2="78" y2="26" stroke={`url(#frameGrad-${variant})`} strokeWidth="4" />
            
            {/* Top Tube (seat clamp to head tube) */}
            <line x1="44" y1="23" x2="77" y2="23" stroke={`url(#frameGrad-${variant})`} strokeWidth="3.2" />
            
            {/* Head Tube */}
            <line x1="77" y1="21" x2="80" y2="29" stroke={`url(#frameGrad-${variant})`} strokeWidth="3.8" />
            
            {/* Front Fork (head tube to front axle) */}
            <line x1="80" y1="29" x2="85" y2="44" stroke={`url(#frameGrad-${variant})`} strokeWidth="3" />
            
            {/* Stem & Handlebars */}
            <line x1="77" y1="21" x2="74" y2="15" stroke="#334155" strokeWidth="2.8" />
            <path d="M72 15 C75 14, 80 15, 83 17" stroke="#0f172a" strokeWidth="3" fill="none" />
            {/* Handlebar Grip */}
            <circle cx="83" cy="17" r="1.8" fill={colorMap.accent} />

            {/* Seat Post & Saddle */}
            <line x1="44" y1="21" x2="43" y2="18" stroke="#334155" strokeWidth="2.5" />
            {/* Aerodynamic Sport Saddle */}
            <path d="M37 17.5 C40 16.5, 46 16.5, 49 18 C47 19.5, 41 19.5, 37 17.5 Z" fill="#0f172a" />
          </g>

          {/* === CRANKSET & PEDALS with ROTATION === */}
          <g id="crankset">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 52 44"
              to="360 52 44"
              dur="0.75s"
              repeatCount="indefinite"
            />
            {/* Chainring */}
            <circle cx="52" cy="44" r="5.5" stroke="#475569" strokeWidth="2" fill="#0f172a" />
            <circle cx="52" cy="44" r="2" fill="#94a3b8" />
            
            {/* Crank arms and pedals */}
            <line x1="52" y1="44" x2="52" y2="35" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="49" y="33.5" width="6" height="2.2" rx="1" fill="#f59e0b" />
            
            <line x1="52" y1="44" x2="52" y2="53" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="49" y="52.3" width="6" height="2.2" rx="1" fill="#f59e0b" />
          </g>
        </g>
      </svg>

      {label && (
        <span className="mt-2 text-xs font-semibold text-slate-600 tracking-tight flex items-center gap-1.5 animate-pulse">
          <span>{label}</span>
        </span>
      )}
    </div>
  );
};
