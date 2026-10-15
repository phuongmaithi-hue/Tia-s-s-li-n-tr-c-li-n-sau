/**
 * Tutorial (Hướng dẫn làm quen)
 * Explains before/after and smaller/larger on the number line with Thỏ Bông
 */

import React, { useState, useEffect } from 'react';
import { Volume2, ArrowRight, Check, X } from 'lucide-react';
import { NumberLine } from './NumberLine';
import { soundManager } from '../utils/audio';

interface TutorialModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onComplete, onSkip }) => {
  // Step: 1 (Ex 1: 2 is before 4), 2 (Ex 2: 7 is after 4), 3 (Interactive Try)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [interactiveChoice, setInteractiveChoice] = useState<number | null>(null);
  const [interactiveFeedback, setInteractiveFeedback] = useState<string | null>(null);

  // Example 1 texts
  const ex1Text = 'Số 2 ở bên trái số 4. Số 2 đứng trước và bé hơn số 4.';
  // Example 2 texts
  const ex2Text = 'Số 7 ở bên phải số 4. Số 7 đứng sau và lớn hơn số 4.';

  // Trigger speech on step change
  useEffect(() => {
    if (step === 1) {
      soundManager.speak(ex1Text);
    } else if (step === 2) {
      soundManager.speak(ex2Text);
    } else if (step === 3) {
      const tryPrompt = 'Bé hãy thử chạm vào một số đứng trước số 4 nhé!';
      soundManager.speak(tryPrompt);
    }
  }, [step]);

  const handleNextExample = () => {
    soundManager.playTap();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleInteractiveTap = (num: number) => {
    soundManager.playTap();
    setInteractiveChoice(num);
    if (num < 4) {
      soundManager.playSuccess();
      const fb = `Giỏi quá! Số ${num} đứng trước số 4, nên ${num} bé hơn 4.`;
      setInteractiveFeedback(fb);
      soundManager.speak(fb);
    } else if (num === 4) {
      soundManager.playGentleHint();
      const fb = 'Đây là số 4 rồi. Em hãy chọn số ở bên trái số 4 nhé!';
      setInteractiveFeedback(fb);
      soundManager.speak(fb);
    } else {
      soundManager.playGentleHint();
      const fb = `Số ${num} ở bên phải số 4 (đứng sau). Em hãy chọn số ở bên trái số 4 nhé!`;
      setInteractiveFeedback(fb);
      soundManager.speak(fb);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border-3 border-amber-300 max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full">
              LÀM QUEN TIA SỐ
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {step === 1 ? 'Ví dụ 1/2' : step === 2 ? 'Ví dụ 2/2' : 'Bé thử tài'}
            </span>
          </div>

          <button
            onClick={onSkip}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold text-xs sm:text-sm px-3 py-1 rounded-lg hover:bg-slate-100"
          >
            <span>Bỏ qua</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Narrative Box */}
        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 font-black text-lg shrink-0">
              {step === 1 ? '1' : step === 2 ? '2' : '★'}
            </div>
            <p className="text-base sm:text-xl font-extrabold text-slate-800">
              {step === 1 && ex1Text}
              {step === 2 && ex2Text}
              {step === 3 && (interactiveFeedback || 'Bé hãy thử chạm vào một số đứng trước số 4 nhé!')}
            </p>
          </div>

          <button
            onClick={() => {
              if (step === 1) soundManager.speak(ex1Text);
              else if (step === 2) soundManager.speak(ex2Text);
              else soundManager.speak(interactiveFeedback || 'Bé hãy thử chạm vào một số đứng trước số 4 nhé!');
            }}
            className="p-2.5 bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-xl shadow-xs shrink-0 active:scale-95"
            aria-label="Nghe lại"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Number Line Demo */}
        <div className="py-2">
          {step === 1 && (
            <NumberLine
              bunnyPosition={4}
              referenceNumber={4}
              highlightedNumbers={[2]}
              arcTrajectory={{ from: 4, to: 2 }}
              disabled={true}
            />
          )}

          {step === 2 && (
            <NumberLine
              bunnyPosition={4}
              referenceNumber={4}
              highlightedNumbers={[7]}
              arcTrajectory={{ from: 4, to: 7 }}
              disabled={true}
            />
          )}

          {step === 3 && (
            <NumberLine
              bunnyPosition={4}
              referenceNumber={4}
              selectedNumber={interactiveChoice}
              onNumberTap={handleInteractiveTap}
              disabled={false}
            />
          )}
        </div>

        {/* Foot Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {step < 3 ? (
            <>
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl active:scale-95"
              >
                Cho bé thử ngay
              </button>
              <button
                onClick={handleNextExample}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-xl shadow-md flex items-center gap-2 active:scale-95"
              >
                <span>{step === 1 ? 'Xem ví dụ 2' : 'Cho bé thử'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setStep(1);
                  setInteractiveFeedback(null);
                  setInteractiveChoice(null);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl"
              >
                Xem lại từ đầu
              </button>
              <button
                onClick={onComplete}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-xl shadow-lg flex items-center gap-2 active:scale-95"
              >
                <span>Bắt đầu chơi nào!</span>
                <Check className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
