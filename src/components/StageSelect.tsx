/**
 * Stage Selection Screen
 * Lets students or teachers pick from the 4 learning stages
 */

import React from 'react';
import { Play, RotateCcw, HelpCircle, Star, Sparkles, CheckCircle2, Sliders } from 'lucide-react';
import { StageId, StageProgress } from '../types';
import { BunnyCharacter } from './BunnyCharacter';
import { soundManager } from '../utils/audio';

interface StageSelectProps {
  progressList: Record<StageId, StageProgress>;
  currentRecommendedStage: StageId;
  onSelectStage: (stageId: StageId) => void;
  onOpenTutorial: () => void;
  onResetAll: () => void;
  onOpenVoiceSettings?: () => void;
}

export const StageSelect: React.FC<StageSelectProps> = ({
  progressList,
  currentRecommendedStage,
  onSelectStage,
  onOpenTutorial,
  onResetAll,
  onOpenVoiceSettings,
}) => {
  const stages: {
    id: StageId;
    title: string;
    subtitle: string;
    icon: string;
    desc: string;
    color: string;
  }[] = [
    {
      id: 1,
      title: 'Chặng 1: Trước hay sau?',
      subtitle: 'Nhận biết số đứng trước và đứng sau',
      icon: '↔️',
      desc: 'Tìm số ở bên trái hoặc bên phải số mốc trên tia số.',
      color: 'from-blue-500 to-sky-600',
    },
    {
      id: 2,
      title: 'Chặng 2: Liền trước – liền sau',
      subtitle: 'Xác định số ở sát ngay bên cạnh',
      icon: '🐇',
      desc: 'Tìm số cách số mốc đúng 1 đơn vị về bên trái hoặc bên phải.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 3,
      title: 'Chặng 3: Bé hơn – lớn hơn',
      subtitle: 'So sánh vị trí và giá trị của số',
      icon: '⚖️',
      desc: 'Số đứng trước bé hơn, số đứng sau lớn hơn.',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 4,
      title: 'Chặng 4: Thử tài của bé',
      subtitle: 'Tổng hợp kiến thức & điền dấu >, <, =',
      icon: '🏆',
      desc: 'Vận dụng tổng hợp và so sánh hai số với các dấu >, <, =.',
      color: 'from-purple-500 to-indigo-600',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
      {/* Top Banner with Bunny Companion */}
      <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 rounded-3xl p-5 border-2 border-amber-300 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BunnyCharacter expression="happy" size={72} />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              BÉ KHÁM PHÁ TIA SỐ
            </h1>
            <p className="text-sm sm:text-base font-bold text-slate-600">
              Chọn một chặng để cùng Thỏ Bông học Toán nhé!
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          {onOpenVoiceSettings && (
            <button
              onClick={() => {
                soundManager.playTap();
                onOpenVoiceSettings();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-xs sm:text-sm border border-amber-300 shadow-xs active:scale-95 transition-all"
            >
              <Sliders className="w-4 h-4 text-amber-700" />
              <span>Giọng đọc</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playTap();
              onOpenTutorial();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-amber-900 rounded-xl font-bold text-xs sm:text-sm border border-amber-200 shadow-xs active:scale-95 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Xem làm quen</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Bạn có muốn bắt đầu lượt mới cho học sinh khác không? Toàn bộ tiến trình sẽ được đặt lại.')) {
                soundManager.playTap();
                onResetAll();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Bắt đầu lượt mới</span>
          </button>
        </div>
      </div>

      {/* Grid of 4 Stages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stages.map((stg) => {
          const progress = progressList[stg.id];
          const isRecommended = stg.id === currentRecommendedStage;

          return (
            <div
              key={stg.id}
              onClick={() => {
                soundManager.playTap();
                onSelectStage(stg.id);
              }}
              className={`
                relative bg-white rounded-3xl p-5 border-2 transition-all duration-200 cursor-pointer
                flex flex-col justify-between gap-3 shadow-md hover:shadow-lg active:scale-[0.98]
                ${
                  isRecommended
                    ? 'border-amber-400 ring-4 ring-amber-300/40 bg-gradient-to-b from-amber-50/50 to-white'
                    : 'border-slate-200 hover:border-slate-300'
                }
              `}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CHẶNG TIẾP THEO</span>
                </div>
              )}

              {/* Stage Top */}
              <div className="flex items-start justify-between gap-2 mt-1">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{stg.icon}</span>
                    <h2 className="text-lg font-black text-slate-900">
                      {stg.title}
                    </h2>
                  </div>
                  <p className="text-sm font-bold text-slate-600">
                    {stg.subtitle}
                  </p>
                </div>

                {progress.completed && (
                  <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã hoàn thành</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {stg.desc}
              </p>

              {/* Stars & CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 ${
                          starIdx <= progress.stars
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-extrabold text-slate-600 tabular-nums">
                    {progress.stars}/5 sao
                  </span>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Chơi ngay</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
