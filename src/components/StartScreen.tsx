/**
 * Opening Screen (Màn hình mở đầu)
 * Contains Game Title, decorative preview of number line with bunny,
 * Large Start CTA, Audio Toggle, Voice Settings button, and Introductory Subtitle.
 */

import React from 'react';
import { Play, Volume2, VolumeX, Sparkles, Sliders } from 'lucide-react';
import { BunnyCharacter } from './BunnyCharacter';

interface StartScreenProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onStartGame: () => void;
  onOpenVoiceSettings: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  isMuted,
  onToggleMute,
  onStartGame,
  onOpenVoiceSettings,
}) => {
  return (
    <div className="w-full min-h-[90vh] flex flex-col items-center justify-center px-4 py-6 text-center select-none">
      <div className="max-w-2xl w-full bg-white/95 rounded-3xl border-3 border-amber-300 shadow-xl p-6 sm:p-10 flex flex-col items-center gap-6">
        
        {/* Top Sound Toggle & Voice Settings */}
        <div className="w-full flex items-center justify-end gap-2">
          <button
            onClick={onOpenVoiceSettings}
            aria-label="Cài đặt giọng đọc"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all active:scale-95"
          >
            <Sliders className="w-4 h-4 text-amber-700" />
            <span>Giọng đọc</span>
          </button>

          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              isMuted
                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? 'Tắt tiếng' : 'Bật tiếng'}</span>
          </button>
        </div>

        {/* Hero Character & Stars */}
        <div className="relative">
          <BunnyCharacter expression="happy" size={96} />
          <div className="absolute -top-3 -right-4 animate-bounce">
            <Sparkles className="w-8 h-8 text-amber-500 fill-amber-300" />
          </div>
        </div>

        {/* Game Title & Intro */}
        <div>
          <span className="text-xs sm:text-sm font-black text-amber-600 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full inline-block mb-2">
            Toán Lớp 1 · Vui Học Tương Tác
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            BÉ KHÁM PHÁ TIA SỐ
          </h1>
          <p className="text-lg sm:text-2xl font-bold text-slate-700 mt-2">
            Cùng tìm số đứng trước, đứng sau nhé!
          </p>
        </div>

        {/* Mini Decorative Number Line Illustration */}
        <div className="w-full bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-500 px-2">
            <span className="text-blue-700 font-extrabold">0 (Bé nhất)</span>
            <span className="text-slate-400">Tia số tăng dần từ trái sang phải ➔</span>
            <span className="text-amber-700 font-extrabold">10 (Lớn nhất)</span>
          </div>

          <div className="relative w-full flex items-center py-2">
            {/* Axis */}
            <div className="h-2 w-full bg-slate-800 rounded-l-full relative flex items-center">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div
                  key={n}
                  className="absolute -top-2 w-0.5 h-6 bg-slate-700"
                  style={{ left: `${(n / 10) * 94 + 3}%` }}
                />
              ))}
            </div>
            {/* Arrow */}
            <div className="relative -ml-1 text-slate-800 shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 12l10-8v6h6v4h-6v6z" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-11 gap-1 text-center font-black text-xs sm:text-sm text-slate-700">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>

        {/* Large Start Button (Touch friendly, >= 60px height) */}
        <button
          onClick={onStartGame}
          className="w-full max-w-sm min-h-[64px] py-4 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black text-2xl shadow-xl shadow-emerald-200/60 flex items-center justify-center gap-3 active:scale-95 transition-all transform cursor-pointer"
        >
          <Play className="w-8 h-8 fill-white" />
          <span>BẮT ĐẦU CHƠI</span>
        </button>

        <p className="text-xs text-slate-400 font-semibold">
          Chạm vào màn hình để bắt đầu · Chơi mượt mà trên iPad
        </p>

      </div>
    </div>
  );
};
