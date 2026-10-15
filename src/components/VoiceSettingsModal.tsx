/**
 * Voice Settings Modal (Cài đặt giọng đọc cho học sinh lớp 1)
 */

import React, { useState, useEffect } from 'react';
import { Volume2, Check, X, Sliders, Info } from 'lucide-react';
import { soundManager, SpeechSpeed } from '../utils/audio';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [speed, setSpeed] = useState<SpeechSpeed>(soundManager.getSpeechSpeed());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(
    soundManager.getCurrentVoice()?.name || ''
  );
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      soundManager.initVoices();
      const voices = soundManager.getAvailableViVoices();
      setAvailableVoices(voices);
      setSelectedVoiceName(soundManager.getCurrentVoice()?.name || '');
      setSpeed(soundManager.getSpeechSpeed());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpeedChange = (newSpeed: SpeechSpeed) => {
    soundManager.setSpeechSpeed(newSpeed);
    setSpeed(newSpeed);
  };

  const handleVoiceChange = (voiceName: string) => {
    soundManager.setVoice(voiceName);
    setSelectedVoiceName(voiceName);
  };

  const handleTestSpeech = () => {
    setIsTesting(true);
    soundManager.speak(
      'Xin chào các em học sinh lớp một! Chúng mình cùng học tia số nhé!',
      () => setIsTesting(false)
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border-3 border-amber-300 max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
        
        {/* Title */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Cài đặt giọng đọc
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Điều chỉnh để học sinh lớp 1 nghe rõ và hiểu bài nhất
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.stopSpeech();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Speed Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-extrabold text-slate-800">
            Tốc độ đọc câu hỏi & phản hồi:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSpeedChange('slow')}
              className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all ${
                speed === 'slow'
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300/50 text-amber-950 font-black'
                  : 'bg-white border-slate-200 text-slate-700 font-bold hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">🐢 Đọc chậm</span>
                {speed === 'slow' && <Check className="w-4 h-4 text-amber-600" />}
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Khuyên dùng cho lớp 1 (rõ từng tiếng, ngắt nghỉ rõ)
              </span>
            </button>

            <button
              onClick={() => handleSpeedChange('normal')}
              className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all ${
                speed === 'normal'
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300/50 text-amber-950 font-black'
                  : 'bg-white border-slate-200 text-slate-700 font-bold hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">🐇 Đọc vừa</span>
                {speed === 'normal' && <Check className="w-4 h-4 text-amber-600" />}
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Tốc độ hội thoại thông thường
              </span>
            </button>
          </div>
        </div>

        {/* Voice Selection (if device has multiple Vietnamese voices) */}
        {availableVoices.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-extrabold text-slate-800">
              Chọn giọng đọc trên máy:
            </label>
            <select
              value={selectedVoiceName}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-sm bg-white text-slate-800 focus:border-amber-400 outline-none"
            >
              {availableVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tip for iPad Safari to get Siri Linh */}
        <div className="bg-blue-50/80 rounded-2xl p-3 border border-blue-200/70 flex items-start gap-2.5 text-xs text-blue-900 font-medium">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            <strong>Mẹo giọng đọc chuẩn trên iPad:</strong> Để có giọng đọc tự nhiên như người thật, bạn vào <em>Cài đặt iPad → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Việt (chọn giọng Linh hoặc Siri)</em>.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handleTestSpeech}
            className={`px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 border active:scale-95 transition-all ${
              isTesting
                ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>{isTesting ? 'Đang đọc thử...' : 'Nghe thử câu mẫu'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.stopSpeech();
              onClose();
            }}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md active:scale-95"
          >
            Xong
          </button>
        </div>

      </div>
    </div>
  );
};
