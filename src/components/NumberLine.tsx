/**
 * NumberLine Component (Tia Số 0 - 10)
 * Designed for iPad touch interaction, perfectly spaced ticks, right arrow,
 * generous non-overlapping 60x60px touch zones, visual region glows, and companion bunny.
 */

import React from 'react';
import { BunnyCharacter, BunnyExpression } from './BunnyCharacter';

interface NumberLineProps {
  bunnyPosition?: number | null; // position 0 to 10 where bunny stands
  bunnyExpression?: BunnyExpression;
  referenceNumber?: number | null; // e.g. 4 for Stage 1 or Stage 2
  highlightedNumbers?: number[]; // numbers to highlight (e.g. Stage 3: [3, 7])
  selectedNumber?: number | null; // currently selected number
  correctNumber?: number | null; // when demonstrating correct answer
  dimNumbersAbove?: number; // dim numbers > dimNumbersAbove (e.g. 5)
  interactiveNumbers?: number[]; // list of numbers that can be tapped (undefined = all 0..10)
  glowRegion?: 'before' | 'after' | 'immediate_before' | 'immediate_after' | null;
  glowRef?: number | null;
  arcTrajectory?: { from: number; to: number; label?: string } | null;
  onNumberTap?: (num: number) => void;
  disabled?: boolean;
}

export const NumberLine: React.FC<NumberLineProps> = ({
  bunnyPosition = null,
  bunnyExpression = 'idle',
  referenceNumber = null,
  highlightedNumbers = [],
  selectedNumber = null,
  correctNumber = null,
  dimNumbersAbove = 10,
  interactiveNumbers,
  glowRegion = null,
  glowRef = null,
  arcTrajectory = null,
  onNumberTap,
  disabled = false,
}) => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Helper to determine if number is clickable
  const isNumberClickable = (num: number) => {
    if (disabled || !onNumberTap) return false;
    if (interactiveNumbers) {
      return interactiveNumbers.includes(num);
    }
    return true;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 select-none">
      {/* Educational Direction Anchor Bar (Clean unboxed helper) */}
      <div className="flex justify-between items-center text-xs md:text-sm font-bold text-slate-500 mb-2 px-6">
        <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-200/60">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Bên trái: <strong>Đứng trước</strong> (Bé hơn)</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200/60">
          <span>Bên phải: <strong>Đứng sau</strong> (Lớn hơn)</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>

      {/* Main Number Line Stage */}
      <div className="relative bg-white rounded-2xl border-2 border-amber-200/80 shadow-md p-4 pt-16 pb-6 overflow-hidden">
        
        {/* Glow region overlays */}
        {glowRegion && glowRef !== null && (
          <div className="absolute inset-x-4 top-14 bottom-6 pointer-events-none transition-all duration-300">
            {glowRegion === 'before' && (
              <div
                className="absolute top-0 bottom-0 left-0 bg-blue-100/60 border-2 border-dashed border-blue-400 rounded-xl animate-gentle-pulse"
                style={{
                  width: `${(glowRef / 10) * 88 + 3}%`,
                }}
              >
                <span className="absolute top-1 left-2 text-[11px] font-bold text-blue-800 bg-white/90 px-2 py-0.5 rounded shadow-xs">
                  Vùng đứng trước ({glowRef})
                </span>
              </div>
            )}
            {glowRegion === 'after' && (
              <div
                className="absolute top-0 bottom-0 bg-amber-100/60 border-2 border-dashed border-amber-400 rounded-xl animate-gentle-pulse"
                style={{
                  left: `${((glowRef + 0.3) / 10) * 88 + 4}%`,
                  right: '4%',
                }}
              >
                <span className="absolute top-1 right-2 text-[11px] font-bold text-amber-800 bg-white/90 px-2 py-0.5 rounded shadow-xs">
                  Vùng đứng sau ({glowRef})
                </span>
              </div>
            )}
            {glowRegion === 'immediate_before' && glowRef > 0 && (
              <div
                className="absolute top-0 bottom-0 bg-emerald-100/70 border-2 border-emerald-500 rounded-xl animate-gentle-pulse"
                style={{
                  left: `${((glowRef - 1) / 10) * 88 + 2}%`,
                  width: '9%',
                }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
                  Liền trước
                </span>
              </div>
            )}
            {glowRegion === 'immediate_after' && glowRef < 10 && (
              <div
                className="absolute top-0 bottom-0 bg-purple-100/70 border-2 border-purple-500 rounded-xl animate-gentle-pulse"
                style={{
                  left: `${((glowRef + 1) / 10) * 88 + 2}%`,
                  width: '9%',
                }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-300">
                  Liền sau
                </span>
              </div>
            )}
          </div>
        )}

        {/* Animated Arc Trajectory (e.g. For Tutorial or Hop demonstration) */}
        {arcTrajectory && (
          <svg className="absolute inset-x-6 top-10 h-16 w-[calc(100%-3rem)] pointer-events-none overflow-visible">
            <defs>
              <marker
                id="arc-arrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284C7" />
              </marker>
            </defs>
            {(() => {
              const fromPercent = (arcTrajectory.from / 10) * 92 + 4;
              const toPercent = (arcTrajectory.to / 10) * 92 + 4;
              const isLeftToRight = toPercent > fromPercent;
              return (
                <path
                  d={`M ${fromPercent}% 45 Q ${(fromPercent + toPercent) / 2}% 2 ${toPercent}% 45`}
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  markerEnd="url(#arc-arrow)"
                  className="animate-pulse"
                />
              );
            })()}
          </svg>
        )}

        {/* Companion Bunny positioned dynamically */}
        {bunnyPosition !== null && (
          <div
            className="absolute top-2 transition-all duration-500 ease-out z-20 pointer-events-none"
            style={{
              left: `calc(${bunnyPosition * 9.09}% + 4.5% - 30px)`,
            }}
          >
            <div className={bunnyExpression === 'hopping' ? 'animate-hop' : ''}>
              <BunnyCharacter expression={bunnyExpression} size={60} />
            </div>
            {referenceNumber === bunnyPosition && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full shadow whitespace-nowrap">
                Số mốc
              </div>
            )}
          </div>
        )}

        {/* The Number Line Line Axis + Arrow */}
        <div className="relative w-full my-6 flex items-center">
          {/* Horizontal Axis Bar */}
          <div className="h-2 w-full bg-slate-800 rounded-l-full relative flex items-center">
            {/* Equidistant Tick Marks */}
            {numbers.map((num) => {
              const isRef = referenceNumber === num;
              const isHighlight = highlightedNumbers.includes(num);
              return (
                <div
                  key={`tick-${num}`}
                  className="absolute -top-3.5 bottom-0 flex flex-col items-center"
                  style={{ left: `${(num / 10) * 92 + 4}%` }}
                >
                  <div
                    className={`w-1 transition-all ${
                      isRef
                        ? 'h-9 bg-amber-600 scale-125'
                        : isHighlight
                        ? 'h-9 bg-blue-600 scale-110'
                        : 'h-8 bg-slate-800'
                    } rounded-full`}
                  />
                </div>
              );
            })}
          </div>

          {/* Right Arrow: Indicating continuation of the number line */}
          <div className="relative -ml-1 text-slate-800 shrink-0 flex items-center">
            <svg
              className="w-7 h-7 -mr-2 drop-shadow-xs"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4 12l10-8v6h6v4h-6v6z" />
            </svg>
          </div>
        </div>

        {/* Number Buttons / Touch Targets */}
        <div className="grid grid-cols-11 gap-1 sm:gap-2 px-1 relative z-10">
          {numbers.map((num) => {
            const isClickable = isNumberClickable(num);
            const isRef = referenceNumber === num;
            const isHighlight = highlightedNumbers.includes(num);
            const isSelected = selectedNumber === num;
            const isCorrect = correctNumber === num;
            const isDimmed = num > dimNumbersAbove;

            // Visual styles for button
            let btnStyle = 'bg-white border-2 border-slate-300 text-slate-800 shadow-sm';

            if (isCorrect) {
              btnStyle = 'bg-emerald-500 border-2 border-emerald-600 text-white shadow-md scale-105';
            } else if (isSelected) {
              btnStyle = 'bg-blue-600 border-2 border-blue-700 text-white shadow-md scale-105';
            } else if (isRef) {
              btnStyle = 'bg-amber-100 border-3 border-amber-500 text-amber-900 font-extrabold ring-2 ring-amber-300/50';
            } else if (isHighlight) {
              btnStyle = 'bg-blue-50 border-3 border-blue-500 text-blue-900 font-extrabold ring-2 ring-blue-300/50 animate-pulse';
            } else if (isClickable) {
              btnStyle = 'bg-white border-2 border-slate-300 hover:border-blue-400 active:bg-blue-50 text-slate-800 cursor-pointer';
            } else {
              btnStyle = 'bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed';
            }

            return (
              <div key={`num-${num}`} className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => onNumberTap?.(num)}
                  aria-label={`Số ${num}${isRef ? ' (Số mốc)' : ''}`}
                  className={`
                    w-12 h-14 sm:w-14 sm:h-16 md:w-16 md:h-18
                    min-w-[48px] min-h-[56px] sm:min-w-[56px] sm:min-h-[60px]
                    flex flex-col items-center justify-center rounded-xl font-black
                    text-xl sm:text-2xl md:text-3xl
                    transition-all duration-150 transform select-none touch-manipulation
                    ${btnStyle}
                    ${isDimmed ? 'opacity-40' : 'opacity-100'}
                    ${isClickable ? 'active:scale-95' : ''}
                  `}
                >
                  <span>{num}</span>
                  {/* Subtle label beneath number for visual reinforcement */}
                  {isRef && (
                    <span className="text-[9px] font-bold text-amber-800 uppercase tracking-tighter -mt-1">
                      Mốc
                    </span>
                  )}
                  {isHighlight && !isRef && (
                    <span className="text-[9px] font-bold text-blue-800 uppercase tracking-tighter -mt-1">
                      Chọn
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
