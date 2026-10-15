/**
 * Stage Results / Completion Screen
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, ArrowRight, Home, Award, Sparkles } from 'lucide-react';
import { StageId, StageProgress } from '../types';
import { BunnyCharacter } from './BunnyCharacter';
import { soundManager } from '../utils/audio';

interface StageResultsProps {
  stageId: StageId;
  progress: StageProgress;
  onReplayStage: () => void;
  onNextStage: () => void;
  onGoHome: () => void;
}

export const StageResults: React.FC<StageResultsProps> = ({
  stageId,
  progress,
  onReplayStage,
  onNextStage,
  onGoHome,
}) => {
  const isFinalStage = stageId === 4;

  useEffect(() => {
    // Play cheer sound & confetti
    soundManager.playSuccess();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const praiseText = isFinalStage
      ? 'Tuyệt vời! Con đã hoàn thành hành trình khám phá tia số!'
      : `Chúc mừng con đã hoàn thành chặng ${stageId}!`;
    soundManager.speak(praiseText);
  }, [stageId, isFinalStage]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center text-center">
      <div className="bg-white rounded-3xl border-3 border-amber-300 shadow-xl p-6 sm:p-8 w-full flex flex-col items-center gap-5">
        
        {/* Companion Celebration */}
        <div className="relative">
          <BunnyCharacter expression="celebrate" size={90} />
          <div className="absolute -top-2 -right-3 animate-bounce">
            <Sparkles className="w-8 h-8 text-amber-500 fill-amber-300" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
            {isFinalStage
              ? 'XUẤT SẮC! HOÀN THÀNH HÀNH TRÌNH'
              : 'CHÚC MỪNG CON!'}
          </h2>
          <p className="text-base sm:text-lg font-bold text-amber-800">
            {isFinalStage
              ? 'Con đã hoàn thành toàn bộ hành trình khám phá tia số!'
              : 'Con đã hoàn thành 5 câu hỏi của chặng này!'}
          </p>
        </div>

        {/* 5 Earned Stars Display */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="relative transform hover:scale-110 transition-transform">
              <Star
                className={`w-10 h-10 sm:w-12 sm:h-12 ${
                  idx <= progress.stars
                    ? 'fill-amber-400 text-amber-500 drop-shadow-md animate-gentle-pulse'
                    : 'text-slate-200'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Detailed Pedagogical Score Metrics (Prompt Requirement: Exactly separate first-try & hint) */}
        <div className="w-full grid grid-cols-2 gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
          <div className="flex flex-col items-center">
            <span className="text-xs sm:text-sm font-bold text-slate-600">
              Đúng ngay lần đầu
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums">
              {progress.firstTryCount}/5
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs sm:text-sm font-bold text-slate-600">
              Cần thêm gợi ý
            </span>
            <span className="text-2xl sm:text-3xl font-black text-blue-600 tabular-nums">
              {progress.hintCount}/5
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              soundManager.playTap();
              onReplayStage();
            }}
            className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Chơi lại</span>
          </button>

          {!isFinalStage ? (
            <button
              onClick={() => {
                soundManager.playTap();
                onNextStage();
              }}
              className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>Chặng tiếp theo</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                soundManager.playTap();
                onGoHome();
              }}
              className="flex-1 py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Award className="w-5 h-5" />
              <span>Nhận huân chương</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playTap();
              onGoHome();
            }}
            className="py-3.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-800 font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Trang chủ</span>
          </button>
        </div>

      </div>
    </div>
  );
};
