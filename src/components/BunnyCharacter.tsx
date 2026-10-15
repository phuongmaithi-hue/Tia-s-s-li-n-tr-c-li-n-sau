/**
 * Companion character "Thỏ Bông" - friendly little bunny for 1st graders
 * Rendered with clean bespoke SVG, responsive and touch-safe
 */

import React from 'react';

export type BunnyExpression = 'idle' | 'happy' | 'hopping' | 'thinking' | 'celebrate';

interface BunnyCharacterProps {
  expression?: BunnyExpression;
  className?: string;
  size?: number; // size in px
}

export const BunnyCharacter: React.FC<BunnyCharacterProps> = ({
  expression = 'idle',
  className = '',
  size = 64,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-block relative select-none pointer-events-none transition-transform duration-300 ${className}`}
      aria-label="Bạn Thỏ Bông đồng hành"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Soft shadow */}
        <ellipse cx="50" cy="94" rx="28" ry="5" fill="#CBD5E1" opacity="0.6" />

        {/* Bunny Feet */}
        <ellipse cx="38" cy="88" rx="9" ry="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
        <ellipse cx="62" cy="88" rx="9" ry="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
        <ellipse cx="38" cy="88" rx="4" ry="2.5" fill="#FCE7F3" />
        <ellipse cx="62" cy="88" rx="4" ry="2.5" fill="#FCE7F3" />

        {/* Bunny Body */}
        <ellipse cx="50" cy="70" rx="22" ry="20" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />
        {/* Cute belly */}
        <ellipse cx="50" cy="73" rx="14" ry="12" fill="#FDF2F8" />

        {/* Tiny cute student backpack strap & scarf */}
        <path d="M40 56 Q50 64 60 56" stroke="#F43F5E" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="50" cy="62" r="3.5" fill="#FB7185" />

        {/* Left Ear */}
        <g
          className={
            expression === 'hopping'
              ? 'origin-bottom -rotate-12 transition-transform'
              : expression === 'thinking'
              ? 'origin-bottom -rotate-6 transition-transform'
              : ''
          }
        >
          <ellipse cx="36" cy="22" rx="7" ry="19" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          <ellipse cx="36" cy="23" rx="3.5" ry="13" fill="#FDA4AF" />
        </g>

        {/* Right Ear */}
        <g
          className={
            expression === 'hopping'
              ? 'origin-bottom rotate-12 transition-transform'
              : expression === 'celebrate'
              ? 'origin-bottom rotate-6 transition-transform'
              : ''
          }
        >
          <ellipse cx="64" cy="22" rx="7" ry="19" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          <ellipse cx="64" cy="23" rx="3.5" ry="13" fill="#FDA4AF" />
        </g>

        {/* Bunny Head */}
        <circle cx="50" cy="44" r="23" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />

        {/* Rosy Cheeks */}
        <circle cx="34" cy="48" r="4.5" fill="#FECDD3" opacity="0.85" />
        <circle cx="66" cy="48" r="4.5" fill="#FECDD3" opacity="0.85" />

        {/* Eyes based on expression */}
        {expression === 'celebrate' ? (
          // Sparkling happy curved eyes ^ ^
          <>
            <path
              d="M34 42 Q39 36 44 42"
              stroke="#1E293B"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M56 42 Q61 36 66 42"
              stroke="#1E293B"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : expression === 'thinking' ? (
          // Curious eyes looking slightly up
          <>
            <circle cx="38" cy="40" r="3.5" fill="#1E293B" />
            <circle cx="39" cy="39" r="1.2" fill="#FFFFFF" />
            <circle cx="60" cy="40" r="3.5" fill="#1E293B" />
            <circle cx="61" cy="39" r="1.2" fill="#FFFFFF" />
          </>
        ) : (
          // Normal friendly big sparkling eyes
          <>
            <circle cx="38" cy="42" r="3.5" fill="#1E293B" />
            <circle cx="39.5" cy="40.5" r="1.3" fill="#FFFFFF" />
            <circle cx="62" cy="42" r="3.5" fill="#1E293B" />
            <circle cx="63.5" cy="40.5" r="1.3" fill="#FFFFFF" />
          </>
        )}

        {/* Little Nose */}
        <path d="M47 47 L53 47 L50 50 Z" fill="#F43F5E" />

        {/* Cheerful Mouth */}
        <path
          d="M46 51 Q50 55 54 51"
          stroke="#1E293B"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Paws */}
        {expression === 'celebrate' ? (
          // Cheering hands raised
          <>
            <ellipse cx="28" cy="46" rx="5" ry="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <ellipse cx="72" cy="46" rx="5" ry="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          </>
        ) : (
          // Little paws tucked in front
          <>
            <ellipse cx="44" cy="67" rx="4" ry="4.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <ellipse cx="56" cy="67" rx="4" ry="4.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          </>
        )}
      </svg>
    </div>
  );
};
