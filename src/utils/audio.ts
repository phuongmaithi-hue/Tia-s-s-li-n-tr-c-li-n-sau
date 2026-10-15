/**
 * Enhanced Audio and Vietnamese Speech Synthesis (TTS)
 * Specifically tuned for 1st-grade Vietnamese learners on iPad / Safari:
 * - Natural slow cadence (rate: 0.78 by default)
 * - Natural pitch (1.0)
 * - Intelligent phrase splitting with commas & ellipses for clear breathing pauses
 * - Prioritizes Siri / Enhanced Vietnamese voices (e.g., Linh, Siri, Google)
 * - Persistent utterance reference to prevent Safari GC cutoff
 * - User-configurable speech speed ("Chậm - rõ ràng" vs "Vừa")
 */

export const VIETNAMESE_NUMBERS: Record<number, string> = {
  0: 'không',
  1: 'một',
  2: 'hai',
  3: 'ba',
  4: 'bốn',
  5: 'năm',
  6: 'sáu',
  7: 'bảy',
  8: 'tám',
  9: 'chín',
  10: 'mười',
};

/**
 * Formats Vietnamese math text with deliberate breathing pauses
 * to prevent robotic slurring and make every word crisp for 1st graders
 */
export function formatSpeechText(text: string): string {
  let result = text;

  // 1. Convert math symbols to words
  result = result.replace(/>/g, ' lớn hơn ');
  result = result.replace(/</g, ' bé hơn ');
  result = result.replace(/=/g, ' bằng ');
  result = result.replace(/□/g, ' ô trống ');

  // 2. Convert numbers in string to Vietnamese words (10 first)
  result = result.replace(/\b10\b/g, ' mười ');
  for (let i = 9; i >= 0; i--) {
    const regex = new RegExp(`\\b${i}\\b`, 'g');
    result = result.replace(regex, ` ${VIETNAMESE_NUMBERS[i]} `);
  }

  // 3. Insert subtle phrasing pauses for primary school auditory processing
  result = result.replace(/Đúng rồi!/gi, 'Đúng rồi!... ');
  result = result.replace(/Tuyệt vời!/gi, 'Tuyệt vời!... ');
  result = result.replace(/Giỏi quá!/gi, 'Giỏi quá!... ');
  result = result.replace(/Chính xác!/gi, 'Chính xác!... ');
  result = result.replace(/Em nhìn lại tia số nhé!/gi, 'Em nhìn lại tia số nhé!... ');
  result = result.replace(/Em thử lại nhé!/gi, 'Em thử lại nhé!... ');

  // Add micro-pause after key question lead-ins
  result = result.replace(/Em hãy chạm vào một số/gi, 'Em hãy chạm vào một số,');
  result = result.replace(/Số nào liền trước/gi, 'Số nào... liền trước,');
  result = result.replace(/Số nào liền sau/gi, 'Số nào... liền sau,');
  result = result.replace(/đứng trước/gi, 'đứng trước,');
  result = result.replace(/đứng sau/gi, 'đứng sau,');
  result = result.replace(/liền trước của/gi, 'liền trước, của');
  result = result.replace(/liền sau của/gi, 'liền sau, của');
  result = result.replace(/bé hơn/gi, 'bé hơn,');
  result = result.replace(/lớn hơn/gi, 'lớn hơn,');
  result = result.replace(/trên tia số nên/gi, 'trên tia số,... nên');
  result = result.replace(/ở bên trái/gi, 'ở bên trái,');
  result = result.replace(/ở bên phải/gi, 'ở bên phải,');

  // Clean up excess spaces
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

export type SpeechSpeed = 'slow' | 'normal';

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private speechSpeed: SpeechSpeed = 'slow'; // Default to slow for 1st graders
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private viVoice: SpeechSynthesisVoice | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private onSpeakingChangeCallbacks: Set<(isSpeaking: boolean) => void> = new Set();
  private isSpeakingNow: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const storedMute = localStorage.getItem('be_tia_so_muted');
      if (storedMute !== null) {
        this.isMuted = storedMute === 'true';
      }

      const storedSpeed = localStorage.getItem('be_tia_so_speed') as SpeechSpeed | null;
      if (storedSpeed === 'slow' || storedSpeed === 'normal') {
        this.speechSpeed = storedSpeed;
      }

      this.initVoices();
    }
  }

  private initAudioContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const findViVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      this.availableVoices = voices.filter(
        (v) =>
          v.lang.toLowerCase().includes('vi') ||
          v.lang.toLowerCase().includes('vn') ||
          v.name.toLowerCase().includes('vietnam')
      );

      // Prioritize natural voices on iPad/iOS (e.g. Linh, Siri) or Google Vietnamese
      let chosen = this.availableVoices.find(
        (v) =>
          v.name.toLowerCase().includes('linh') ||
          v.name.toLowerCase().includes('siri') ||
          v.name.toLowerCase().includes('premium') ||
          v.name.toLowerCase().includes('enhanced')
      );

      if (!chosen) {
        chosen = this.availableVoices.find((v) =>
          v.name.toLowerCase().includes('google')
        );
      }

      if (!chosen && this.availableVoices.length > 0) {
        chosen = this.availableVoices[0];
      }

      // If user saved a specific voice name
      const savedVoiceName = localStorage.getItem('be_tia_so_voice_name');
      if (savedVoiceName) {
        const matched = this.availableVoices.find((v) => v.name === savedVoiceName);
        if (matched) chosen = matched;
      }

      if (chosen) {
        this.viVoice = chosen;
      }
    };

    findViVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = findViVoice;
    }
  }

  public getAvailableViVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices;
  }

  public getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.viVoice;
  }

  public setVoice(voiceName: string) {
    const found = this.availableVoices.find((v) => v.name === voiceName);
    if (found) {
      this.viVoice = found;
      localStorage.setItem('be_tia_so_voice_name', voiceName);
    }
  }

  public getSpeechSpeed(): SpeechSpeed {
    return this.speechSpeed;
  }

  public setSpeechSpeed(speed: SpeechSpeed) {
    this.speechSpeed = speed;
    localStorage.setItem('be_tia_so_speed', speed);
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('be_tia_so_muted', String(muted));
    if (muted) {
      this.stopSpeech();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public unlockAudio() {
    this.initAudioContext();
    this.initVoices();
  }

  public subscribeSpeakingChange(cb: (isSpeaking: boolean) => void): () => void {
    this.onSpeakingChangeCallbacks.add(cb);
    return () => {
      this.onSpeakingChangeCallbacks.delete(cb);
    };
  }

  private notifySpeakingState(speaking: boolean) {
    this.isSpeakingNow = speaking;
    this.onSpeakingChangeCallbacks.forEach((cb) => cb(speaking));
  }

  public isSpeaking(): boolean {
    return this.isSpeakingNow;
  }

  public stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.notifySpeakingState(false);
  }

  /**
   * Speak Vietnamese text using Web Speech API with tuned speed, pitch, and phrasing
   */
  public speak(text: string, onEnd?: () => void) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    this.stopSpeech();

    const formatted = formatSpeechText(text);
    const utterance = new SpeechSynthesisUtterance(formatted);
    utterance.lang = 'vi-VN';

    // Speed tuned specifically for 1st grade:
    // 'slow': 0.76 (Clear, spacious enunciation)
    // 'normal': 0.85
    utterance.rate = this.speechSpeed === 'slow' ? 0.76 : 0.85;
    utterance.pitch = 1.0; // Warm, natural human pitch (not high/squeaky)

    if (this.viVoice) {
      utterance.voice = this.viVoice;
    } else {
      this.initVoices();
      if (this.viVoice) {
        utterance.voice = this.viVoice;
      }
    }

    this.notifySpeakingState(true);

    utterance.onend = () => {
      this.currentUtterance = null;
      this.notifySpeakingState(false);
      onEnd?.();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      this.notifySpeakingState(false);
      onEnd?.();
    };

    // Keep reference on window to avoid iOS Safari garbage collecting mid-sentence
    this.currentUtterance = utterance;
    (window as unknown as { __activeUtterance?: SpeechSynthesisUtterance }).__activeUtterance = utterance;

    window.speechSynthesis.speak(utterance);
  }

  // --- Sound Effects using Web Audio API Synthesizer ---

  public playSuccess() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.36);
    });
  }

  public playGentleHint() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37]; // A4, C#5
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.41);
    });
  }

  public playHop() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playTap() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playStar() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [784, 988, 1175, 1568];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.06 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.32);
    });
  }
}

export const soundManager = new AudioManager();
