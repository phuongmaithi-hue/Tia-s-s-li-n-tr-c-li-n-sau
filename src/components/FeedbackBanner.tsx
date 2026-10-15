/**
 * Feedback banner shown after an answer is submitted or when a hint is given
 */

import React from 'react';
import { CheckCircle2, HelpCircle, ArrowRight, Volume2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface FeedbackBannerProps {
  status: 'correct' | 'hint1' | 'hint2' | 'reference_clicked';
  message: string;
  onContinue?: () => void;
  onRetry?: () => void;
  onReplaySpeech?: () => void;
  continueText?: string;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  status,
  message,
  onContinue,
  onRetry,
  onReplaySpeech,
  continueText = 'Tiếp tục',
}) => {
  const isCorrect = status === 'correct';
  const isRefClicked = status === 'reference_clicked';

  return (
    <div
      className={`w-full max-w-4xl mx-auto mt-4 p-4 rounded-2xl border-2 transition-all duration-300 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 ${
        isCorrect
          ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
          : isRefClicked
          ? 'bg-amber-50 border-amber-400 text-amber-900'
          : 'bg-blue-50 border-blue-400 text-blue-900'
      }`}
    >
      {/* Icon + Feedback message */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="shrink-0">
          {isCorrect ? (
            <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-sm">
              <HelpCircle className="w-7 h-7" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <p className="text-base sm:text-lg font-bold leading-snug">
            {message}
          </p>
        </div>

        {onReplaySpeech && (
          <button
            onClick={onReplaySpeech}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white/80 rounded-lg shrink-0 border border-slate-200"
            aria-label="Nghe lại lời giải"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Action button */}
      <div className="shrink-0 w-full sm:w-auto flex justify-end">
        {onContinue && (
          <button
            onClick={onContinue}
            className={`
              w-full sm:w-auto min-w-[140px] min-h-[52px] px-6 py-3
              flex items-center justify-center gap-2 rounded-xl font-extrabold text-base sm:text-lg
              shadow-md active:scale-95 transition-all
              ${
                isCorrect
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }
            `}
          >
            <span>{continueText}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full sm:w-auto min-w-[140px] min-h-[52px] px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-extrabold text-base sm:text-lg shadow-md active:scale-95 transition-all"
          >
            Em thử lại nhé!
          </button>
        )}
      </div>
    </div>
  );
};
