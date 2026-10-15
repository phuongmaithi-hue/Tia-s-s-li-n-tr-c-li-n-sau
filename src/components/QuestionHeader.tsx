/**
 * Question Header Component
 * Contains Stage title, question progress ("Câu X/5"), speaker replay button,
 * collected stars, home button, voice settings, and audio mute toggle.
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Home, Star, Sliders } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface QuestionHeaderProps {
  stageTitle: string;
  questionNumber: number;
  totalQuestions: number;
  isPractice?: boolean;
  earnedStars: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onHomeClick: () => void;
  onReplaySpeech: () => void;
  onOpenVoiceSettings: () => void;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  stageTitle,
  questionNumber,
  totalQuestions,
  isPractice = false,
  earnedStars,
  isMuted,
  onToggleMute,
  onHomeClick,
  onReplaySpeech,
  onOpenVoiceSettings,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(soundManager.isSpeaking());

  useEffect(() => {
    const unsub = soundManager.subscribeSpeakingChange(setIsSpeaking);
    return unsub;
  }, []);

  return (
    <header className="w-full max-w-4xl mx-auto flex items-center justify-between px-3 py-2 bg-white/95 backdrop-blur-xs rounded-xl border border-amber-200/60 shadow-xs mb-3">
      {/* Left: Home & Stage Name */}
      <div className="flex items-center gap-2">
        <button
          onClick={onHomeClick}
          aria-label="Về trang chủ"
          className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition-all"
        >
          <Home className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block -mb-0.5">
            {stageTitle}
          </span>
          <span className="text-sm font-extrabold text-slate-800">
            {isPractice ? (
              <span className="text-amber-600">Câu luyện tập thêm</span>
            ) : (
              `Câu ${questionNumber}/${totalQuestions}`
            )}
          </span>
        </div>
      </div>

      {/* Middle: Stars collected */}
      <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
        <span className="text-xs font-extrabold text-amber-900 tabular-nums">
          {earnedStars} sao
        </span>
      </div>

      {/* Right: Audio Speaker, Voice Settings & Mute Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReplaySpeech}
          aria-label="Nghe lại câu hỏi"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs border active:scale-95 transition-all ${
            isSpeaking
              ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-300/40 animate-pulse'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isSpeaking ? 'Đang đọc...' : 'Nghe lại'}
          </span>
        </button>

        <button
          onClick={onOpenVoiceSettings}
          aria-label="Cài đặt giọng đọc"
          title="Chỉnh tốc độ và giọng đọc"
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg active:scale-95 transition-all"
        >
          <Sliders className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className={`p-2 rounded-lg active:scale-95 transition-all ${
            isMuted
              ? 'bg-rose-100 text-rose-700 border border-rose-300'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
