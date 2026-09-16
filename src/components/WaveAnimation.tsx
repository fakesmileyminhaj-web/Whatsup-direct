import React from 'react';

interface WaveAnimationProps {
  enabled: boolean;
  speed: 'calm' | 'natural' | 'slow';
}

export const WaveAnimation: React.FC<WaveAnimationProps> = ({ enabled, speed }) => {
  if (!enabled) return null;

  const durationMap = {
    slow: '8s',
    natural: '6s',
    calm: '5s',
  };

  const duration = durationMap[speed] || '6s';

  return (
    <div
      id="bottom-wave-container"
      className="absolute bottom-0 left-0 right-0 h-28 sm:h-36 overflow-hidden pointer-events-none z-0"
      style={{ '--wave-duration': duration } as React.CSSProperties}
      aria-hidden="true"
    >
      <svg
        className="absolute bottom-0 w-full h-full min-w-[600px] text-[var(--theme-color)]"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        {/* Deep background soft wave */}
        <path
          className="animate-wave-3"
          fill="currentColor"
          fillOpacity="0.04"
          d="M0,192L48,197.3C96,203,192,213,288,224C384,235,480,245,576,229.3C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />

        {/* Middle breathing wave */}
        <path
          className="animate-wave-2"
          fill="currentColor"
          fillOpacity="0.08"
          d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,218.7C840,235,960,245,1080,234.7C1200,224,1320,192,1380,176L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />

        {/* Foreground crest wave */}
        <path
          className="animate-wave-1"
          fill="currentColor"
          fillOpacity="0.14"
          d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,245.3C672,256,768,256,864,240C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  );
};
