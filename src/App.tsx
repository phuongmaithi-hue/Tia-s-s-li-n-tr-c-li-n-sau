/**
 * BÉ KHÁM PHÁ TIA SỐ - Interactive Grade 1 Math App for iPad
 * Built with precision adhering to Vietnamese primary curriculum guidelines
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StageId,
  ScreenState,
  Question,
  StageProgress,
  BeforeAfterQuestion,
  ImmediateQuestion,
  CompareTwoStepQuestion,
  CompareDirectQuestion,
  FillSignQuestion,
} from './types';
import { soundManager } from './utils/audio';
import {
  getQuestionsForStage,
  generateBeforeAfterPractice,
  generateImmediatePractice,
  generateComparePractice,
  generateFillSignPractice,
} from './utils/questionGenerator';

import { StartScreen } from './components/StartScreen';
import { StageSelect } from './components/StageSelect';
import { TutorialModal } from './components/TutorialModal';
import { QuestionHeader } from './components/QuestionHeader';
import { NumberLine } from './components/NumberLine';
import { FeedbackBanner } from './components/FeedbackBanner';
import { StageResults } from './components/StageResults';
import { BunnyExpression } from './components/BunnyCharacter';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';

const STORAGE_KEY = 'be_kham_pha_tia_so_progress';

const INITIAL_PROGRESS: Record<StageId, StageProgress> = {
  1: { stageId: 1, completed: false, stars: 0, firstTryCount: 0, hintCount: 0 },
  2: { stageId: 2, completed: false, stars: 0, firstTryCount: 0, hintCount: 0 },
  3: { stageId: 3, completed: false, stars: 0, firstTryCount: 0, hintCount: 0 },
  4: { stageId: 4, completed: false, stars: 0, firstTryCount: 0, hintCount: 0 },
};

export default function App() {
  // Screen state
  const [screenState, setScreenState] = useState<ScreenState>('start');
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);

  // Overall Stage Progress
  const [progressList, setProgressList] = useState<Record<StageId, StageProgress>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PROGRESS;
  });

  // Current playing stage & questions
  const [currentStageId, setCurrentStageId] = useState<StageId>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  // Question session state
  const [attemptsOnQuestion, setAttemptsOnQuestion] = useState<number>(0);
  const [firstTryFailed, setFirstTryFailed] = useState<boolean>(false);
  const [isPractice, setIsPractice] = useState<boolean>(false);
  const [resumeOriginalQuestion, setResumeOriginalQuestion] = useState<Question | null>(null);

  // Interactive UI state for number line & answers
  const [bunnyPosition, setBunnyPosition] = useState<number | null>(4);
  const [bunnyExpr, setBunnyExpr] = useState<BunnyExpression>('idle');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [correctDemonstrationNumber, setCorrectDemonstrationNumber] = useState<number | null>(null);
  const [arcTrajectory, setArcTrajectory] = useState<{ from: number; to: number } | null>(null);
  const [glowRegion, setGlowRegion] = useState<'before' | 'after' | 'immediate_before' | 'immediate_after' | null>(null);
  const [glowRef, setGlowRef] = useState<number | null>(null);

  // Touch lock to prevent multi-tap glitches on iPad
  const [isAnswerLocked, setIsAnswerLocked] = useState<boolean>(false);

  // Feedback banner state
  const [feedbackStatus, setFeedbackStatus] = useState<'correct' | 'hint1' | 'hint2' | 'reference_clicked' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Stage round statistics (for current 5 questions)
  const [stageStarsEarned, setStageStarsEarned] = useState<number>(0);
  const [stageFirstTryCount, setStageFirstTryCount] = useState<number>(0);
  const [stageHintCount, setStageHintCount] = useState<number>(0);

  // Two-step comparison state for Stage 3
  const [twoStepStep, setTwoStepStep] = useState<1 | 2>(1);
  const [twoStepFirstCorrect, setTwoStepFirstCorrect] = useState<boolean>(false);

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressList));
    } catch {
      // ignore
    }
  }, [progressList]);

  // Determine recommended stage: first incomplete stage or stage 1
  const recommendedStageId: StageId = (() => {
    if (!progressList[1].completed) return 1;
    if (!progressList[2].completed) return 2;
    if (!progressList[3].completed) return 3;
    if (!progressList[4].completed) return 4;
    return 1;
  })();

  // Handle Mute toggle
  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Start game from Opening Screen
  const handleStartGame = () => {
    soundManager.unlockAudio();
    soundManager.playTap();

    // Check if player hasn't done stage 1, optionally show tutorial first time
    const hasPlayedBefore = progressList[1].completed || progressList[1].stars > 0;
    if (!hasPlayedBefore) {
      setShowTutorial(true);
    }
    setScreenState('stage_select');
  };

  // Initialize and load a stage
  const startStage = (stageId: StageId) => {
    soundManager.playTap();
    const newQuestions = getQuestionsForStage(stageId);
    setCurrentStageId(stageId);
    setQuestions(newQuestions);
    setCurrentQuestionIdx(0);
    setActiveQuestion(newQuestions[0]);
    setIsPractice(false);
    setResumeOriginalQuestion(null);
    setStageStarsEarned(0);
    setStageFirstTryCount(0);
    setStageHintCount(0);
    setScreenState('playing');
  };

  // Setup visual state when activeQuestion changes
  useEffect(() => {
    if (!activeQuestion || screenState !== 'playing') return;

    // Reset question-level variables
    setAttemptsOnQuestion(0);
    setFirstTryFailed(false);
    setSelectedNumber(null);
    setCorrectDemonstrationNumber(null);
    setArcTrajectory(null);
    setGlowRegion(null);
    setGlowRef(null);
    setFeedbackStatus(null);
    setFeedbackMessage(null);
    setIsAnswerLocked(false);
    setBunnyExpr('idle');

    if (activeQuestion.type === 'compare_two_step') {
      setTwoStepStep(1);
      setTwoStepFirstCorrect(false);
    }

    // Set initial bunny position and speak prompt
    if (activeQuestion.type === 'before_after') {
      setBunnyPosition(activeQuestion.referenceNumber);
      setBunnyExpr('idle');
      soundManager.speak(activeQuestion.speechText || activeQuestion.promptText);
    } else if (activeQuestion.type === 'immediate') {
      setBunnyPosition(activeQuestion.referenceNumber);
      setBunnyExpr('thinking');
      soundManager.speak(activeQuestion.speechText || activeQuestion.promptText);
    } else if (activeQuestion.type === 'compare_two_step') {
      setBunnyPosition(activeQuestion.numA);
      setBunnyExpr('thinking');
      soundManager.speak(activeQuestion.step1Prompt);
    } else if (activeQuestion.type === 'compare_direct') {
      setBunnyPosition(activeQuestion.numA);
      setBunnyExpr('thinking');
      soundManager.speak(activeQuestion.speechText || activeQuestion.promptText);
    } else if (activeQuestion.type === 'fill_sign') {
      setBunnyPosition(activeQuestion.numA);
      setBunnyExpr('thinking');
      soundManager.speak(activeQuestion.speechText || activeQuestion.promptText);
    }
  }, [activeQuestion, screenState]);

  // -------------------------------------------------------------
  // HANDLERS FOR EACH QUESTION TYPE
  // -------------------------------------------------------------

  // STAGE 1 & STAGE 4: Number line tap for "Trước hay sau"
  const handleBeforeAfterTap = (chosenNum: number) => {
    if (isAnswerLocked || !activeQuestion || activeQuestion.type !== 'before_after') return;

    soundManager.playTap();
    setIsAnswerLocked(true);
    setSelectedNumber(chosenNum);

    const ref = activeQuestion.referenceNumber;
    const isBefore = activeQuestion.subType === 'before';

    // 1. If tapped reference number itself:
    if (chosenNum === ref) {
      soundManager.playGentleHint();
      setFeedbackStatus('reference_clicked');
      const sideText = isBefore ? 'ở bên trái' : 'ở bên phải';
      const msg = `Đây là số ${ref}. Em hãy chọn một số ${sideText} số ${ref} nhé!`;
      setFeedbackMessage(msg);
      soundManager.speak(msg);
      // Unlock after gentle delay so student can tap another number
      setTimeout(() => setIsAnswerLocked(false), 800);
      return;
    }

    // Check correctness: accepts ANY number < ref (for before) or > ref (for after)
    const isCorrect = isBefore
      ? chosenNum < ref && chosenNum <= activeQuestion.maxAllowedRange
      : chosenNum > ref && chosenNum <= activeQuestion.maxAllowedRange;

    if (isCorrect) {
      // SUCCESS!
      soundManager.playSuccess();
      setBunnyPosition(chosenNum);
      setBunnyExpr('celebrate');
      setFeedbackStatus('correct');
      setGlowRegion(null);

      const relationWord = isBefore ? 'đứng trước' : 'đứng sau';
      const compWord = isBefore ? 'bé hơn' : 'lớn hơn';
      const msg = `Đúng rồi! ${chosenNum} ${relationWord} ${ref}. ${chosenNum} ${compWord} ${ref}.`;
      setFeedbackMessage(msg);
      soundManager.speak(msg);

      // Record score if this wasn't practice
      if (!isPractice) {
        setStageStarsEarned((prev) => prev + 1);
        if (!firstTryFailed) {
          setStageFirstTryCount((prev) => prev + 1);
        } else {
          setStageHintCount((prev) => prev + 1);
        }
      }
    } else {
      // INCORRECT
      handleIncorrectAnswer({
        chosenNum,
        ref,
        direction: isBefore ? 'before' : 'after',
      });
    }
  };

  // STAGE 2 & STAGE 4: Immediate Predecessor / Successor (Liền trước - liền sau)
  const handleImmediateChoice = (chosenNum: number) => {
    if (isAnswerLocked || !activeQuestion || activeQuestion.type !== 'immediate') return;

    soundManager.playTap();
    setIsAnswerLocked(true);
    setSelectedNumber(chosenNum);

    const ref = activeQuestion.referenceNumber;
    const isBefore = activeQuestion.subType === 'immediate_before';
    const isCorrect = chosenNum === activeQuestion.correctAnswer;

    if (isCorrect) {
      soundManager.playSuccess();
      setBunnyPosition(chosenNum);
      setBunnyExpr('hopping');
      setArcTrajectory({ from: ref, to: chosenNum });
      setFeedbackStatus('correct');
      setGlowRegion(null);

      const term = isBefore ? 'số liền trước' : 'số liền sau';
      const msg = `Đúng rồi! ${chosenNum} là ${term} của ${ref}.`;
      setFeedbackMessage(msg);
      soundManager.speak(msg);

      if (!isPractice) {
        setStageStarsEarned((prev) => prev + 1);
        if (!firstTryFailed) {
          setStageFirstTryCount((prev) => prev + 1);
        } else {
          setStageHintCount((prev) => prev + 1);
        }
      }
    } else {
      // Check if chosenNum was in the same direction (standing before/after but not immediate)
      const sameDirection = isBefore ? chosenNum < ref : chosenNum > ref;
      handleImmediateIncorrect({
        chosenNum,
        ref,
        isBefore,
        sameDirection,
      });
    }
  };

  // STAGE 3: Compare Two-Step
  const handleTwoStepTap = (chosenNum: number) => {
    if (isAnswerLocked || !activeQuestion || activeQuestion.type !== 'compare_two_step') return;

    soundManager.playTap();
    setIsAnswerLocked(true);
    setSelectedNumber(chosenNum);

    const q = activeQuestion;

    if (twoStepStep === 1) {
      // Step 1: "Số nào đứng trước / đứng sau?"
      const isCorrectStep1 = chosenNum === q.step1Correct;
      if (isCorrectStep1) {
        soundManager.playSuccess();
        setBunnyPosition(chosenNum);
        setBunnyExpr('happy');
        setTwoStepFirstCorrect(true);
        setTwoStepStep(2);
        setFeedbackStatus('correct');
        const term = q.step1Target === 'before' ? 'đứng trước' : 'đứng sau';
        const other = chosenNum === q.numA ? q.numB : q.numA;
        const msg = `Chính xác! ${chosenNum} ${term} ${other}. Bé hãy trả lời tiếp câu 2 nhé!`;
        setFeedbackMessage(msg);
        soundManager.speak(msg, () => {
          // Speak Step 2 prompt
          setTimeout(() => {
            soundManager.speak(q.step2Prompt);
            setIsAnswerLocked(false);
          }, 300);
        });
      } else {
        handleTwoStepIncorrect(1);
      }
    } else {
      // Step 2: "Vậy số nào bé hơn / lớn hơn?"
      const isCorrectStep2 = chosenNum === q.step2Correct;
      if (isCorrectStep2) {
        soundManager.playSuccess();
        setBunnyPosition(chosenNum);
        setBunnyExpr('celebrate');
        setFeedbackStatus('correct');

        const term = q.step1Target === 'before' ? 'đứng trước' : 'đứng sau';
        const comp = q.step2Target === 'smaller' ? 'bé hơn' : 'lớn hơn';
        const other = chosenNum === q.numA ? q.numB : q.numA;
        const msg = `Đúng rồi! ${chosenNum} ${term} ${other} trên tia số nên ${chosenNum} ${comp} ${other}.`;
        setFeedbackMessage(msg);
        soundManager.speak(msg);

        if (!isPractice) {
          setStageStarsEarned((prev) => prev + 1);
          if (!firstTryFailed && twoStepFirstCorrect) {
            setStageFirstTryCount((prev) => prev + 1);
          } else {
            setStageHintCount((prev) => prev + 1);
          }
        }
      } else {
        handleTwoStepIncorrect(2);
      }
    }
  };

  // STAGE 3 & 4: Direct comparison (tap on highlighted number)
  const handleCompareDirectTap = (chosenNum: number) => {
    if (isAnswerLocked || !activeQuestion || activeQuestion.type !== 'compare_direct') return;

    soundManager.playTap();
    setIsAnswerLocked(true);
    setSelectedNumber(chosenNum);

    const q = activeQuestion;
    const isCorrect = chosenNum === q.correctAnswer;

    if (isCorrect) {
      soundManager.playSuccess();
      setBunnyPosition(chosenNum);
      setBunnyExpr('celebrate');
      setFeedbackStatus('correct');

      const isSmaller = q.target === 'smaller';
      const other = chosenNum === q.numA ? q.numB : q.numA;
      const term = isSmaller ? 'đứng trước' : 'đứng sau';
      const comp = isSmaller ? 'bé hơn' : 'lớn hơn';

      const msg = `Đúng rồi! ${chosenNum} ${term} ${other} trên tia số nên ${chosenNum} ${comp} ${other}.`;
      setFeedbackMessage(msg);
      soundManager.speak(msg);

      if (!isPractice) {
        setStageStarsEarned((prev) => prev + 1);
        if (!firstTryFailed) {
          setStageFirstTryCount((prev) => prev + 1);
        } else {
          setStageHintCount((prev) => prev + 1);
        }
      }
    } else {
      handleCompareDirectIncorrect();
    }
  };

  // STAGE 4: Fill Sign (>, <, =)
  const handleFillSignChoice = (chosenSign: '>' | '<' | '=') => {
    if (isAnswerLocked || !activeQuestion || activeQuestion.type !== 'fill_sign') return;

    soundManager.playTap();
    setIsAnswerLocked(true);

    const q = activeQuestion;
    const isCorrect = chosenSign === q.correctSign;

    // Speak sign name on tap as required
    const signSpoken =
      chosenSign === '>' ? 'lớn hơn' : chosenSign === '<' ? 'bé hơn' : 'bằng';

    if (isCorrect) {
      soundManager.playSuccess();
      setBunnyExpr('celebrate');
      setFeedbackStatus('correct');

      let msg = '';
      if (q.numA === q.numB) {
        msg = `Đúng rồi! Hai số đều là ${q.numA} nên ${q.numA} bằng ${q.numB}. Chọn dấu bằng (=).`;
      } else if (q.correctSign === '<') {
        msg = `Đúng rồi! ${q.numA} đứng trước ${q.numB} nên ${q.numA} bé hơn ${q.numB}. Chọn dấu bé hơn (<).`;
      } else {
        msg = `Đúng rồi! ${q.numA} đứng sau ${q.numB} nên ${q.numA} lớn hơn ${q.numB}. Chọn dấu lớn hơn (>).`;
      }
      setFeedbackMessage(msg);
      soundManager.speak(msg);

      if (!isPractice) {
        setStageStarsEarned((prev) => prev + 1);
        if (!firstTryFailed) {
          setStageFirstTryCount((prev) => prev + 1);
        } else {
          setStageHintCount((prev) => prev + 1);
        }
      }
    } else {
      handleFillSignIncorrect(chosenSign);
    }
  };

  // -------------------------------------------------------------
  // ERROR HANDLING & PRACTICE FLOW (Prompt Section 11)
  // -------------------------------------------------------------

  const handleIncorrectAnswer = ({
    chosenNum,
    ref,
    direction,
  }: {
    chosenNum: number;
    ref: number;
    direction: 'before' | 'after';
  }) => {
    soundManager.playGentleHint();
    setBunnyExpr('thinking');
    setFirstTryFailed(true);

    if (attemptsOnQuestion === 0) {
      // Attempt 1: Gentle hint & visual highlight
      setAttemptsOnQuestion(1);
      setFeedbackStatus('hint1');
      setGlowRegion(direction);
      setGlowRef(ref);

      const sideText = direction === 'before' ? 'bên trái' : 'bên phải';
      const term = direction === 'before' ? 'đứng trước' : 'đứng sau';
      const msg = `Em nhìn lại tia số nhé! Số ${term} phải ở ${sideText} số ${ref}.`;
      setFeedbackMessage(msg);
      soundManager.speak(msg);
      setTimeout(() => setIsAnswerLocked(false), 600);
    } else {
      // Attempt 2: Demonstrate correct answer + launch practice question
      setAttemptsOnQuestion(2);
      setFeedbackStatus('hint2');
      const demoAnswer = direction === 'before' ? ref - 1 : ref + 1;
      setCorrectDemonstrationNumber(demoAnswer);
      setBunnyPosition(demoAnswer);
      setGlowRegion(null);

      const sideText = direction === 'before' ? 'bên trái' : 'bên phải';
      const term = direction === 'before' ? 'đứng trước' : 'đứng sau';
      const comp = direction === 'before' ? 'bé hơn' : 'lớn hơn';
      const msg = `Ví dụ: Số ${demoAnswer} ở ${sideText} số ${ref}. ${demoAnswer} ${term} và ${comp} ${ref}. Cùng làm một câu luyện tập nhé!`;
      setFeedbackMessage(msg);
      soundManager.speak(msg);

      // Transition to practice question on "Tiếp tục"
    }
  };

  const handleImmediateIncorrect = ({
    chosenNum,
    ref,
    isBefore,
    sameDirection,
  }: {
    chosenNum: number;
    ref: number;
    isBefore: boolean;
    sameDirection: boolean;
  }) => {
    soundManager.playGentleHint();
    setBunnyExpr('thinking');
    setFirstTryFailed(true);

    if (attemptsOnQuestion === 0) {
      setAttemptsOnQuestion(1);
      setFeedbackStatus('hint1');
      setGlowRegion(isBefore ? 'immediate_before' : 'immediate_after');
      setGlowRef(ref);

      let msg = '';
      if (sameDirection) {
        const side = isBefore ? 'bên trái' : 'bên phải';
        msg = `Số ${chosenNum} ${isBefore ? 'đứng trước' : 'đứng sau'} ${ref}. Nhưng số liền ${isBefore ? 'trước' : 'sau'} phải ở sát ngay ${side} số ${ref}. Em thử lại nhé!`;
      } else {
        const side = isBefore ? 'sát ngay bên trái' : 'sát ngay bên phải';
        msg = `Em nhìn lại tia số nhé! Số liền ${isBefore ? 'trước' : 'sau'} phải ở ${side} số ${ref}.`;
      }
      setFeedbackMessage(msg);
      soundManager.speak(msg);
      setTimeout(() => setIsAnswerLocked(false), 600);
    } else {
      setAttemptsOnQuestion(2);
      setFeedbackStatus('hint2');
      const correctAns = isBefore ? ref - 1 : ref + 1;
      setCorrectDemonstrationNumber(correctAns);
      setBunnyPosition(correctAns);
      setGlowRegion(null);

      const term = isBefore ? 'liền trước' : 'liền sau';
      const side = isBefore ? 'sát bên trái' : 'sát bên phải';
      const msg = `Số ${correctAns} ở ${side} số ${ref}, nên ${correctAns} là số ${term} của ${ref}. Cùng làm một câu luyện tập nhé!`;
      setFeedbackMessage(msg);
      soundManager.speak(msg);
    }
  };

  const handleTwoStepIncorrect = (step: 1 | 2) => {
    soundManager.playGentleHint();
    setFirstTryFailed(true);

    if (attemptsOnQuestion === 0) {
      setAttemptsOnQuestion(1);
      setFeedbackStatus('hint1');
      const msg = 'Em nhìn lại vị trí của hai số trên tia số nhé!';
      setFeedbackMessage(msg);
      soundManager.speak(msg);
      setTimeout(() => setIsAnswerLocked(false), 600);
    } else {
      setAttemptsOnQuestion(2);
      setFeedbackStatus('hint2');
      const q = activeQuestion as CompareTwoStepQuestion;
      const correct = step === 1 ? q.step1Correct : q.step2Correct;
      setCorrectDemonstrationNumber(correct);
      setBunnyPosition(correct);

      const msg = `Đáp án đúng là ${correct}. Cùng làm một câu luyện tập nhé!`;
      setFeedbackMessage(msg);
      soundManager.speak(msg);
    }
  };

  const handleCompareDirectIncorrect = () => {
    soundManager.playGentleHint();
    setFirstTryFailed(true);

    if (attemptsOnQuestion === 0) {
      setAttemptsOnQuestion(1);
      setFeedbackStatus('hint1');
      const msg = 'Em nhìn lại tia số nhé! Số ở bên trái bé hơn, số ở bên phải lớn hơn.';
      setFeedbackMessage(msg);
      soundManager.speak(msg);
      setTimeout(() => setIsAnswerLocked(false), 600);
    } else {
      setAttemptsOnQuestion(2);
      setFeedbackStatus('hint2');
      const q = activeQuestion as CompareDirectQuestion;
      setCorrectDemonstrationNumber(q.correctAnswer);
      setBunnyPosition(q.correctAnswer);

      const term = q.target === 'smaller' ? 'bé hơn' : 'lớn hơn';
      const msg = `Số ${q.correctAnswer} là số ${term}. Cùng làm một câu luyện tập nhé!`;
      setFeedbackMessage(msg);
      soundManager.speak(msg);
    }
  };

  const handleFillSignIncorrect = (chosenSign: '>' | '<' | '=') => {
    soundManager.playGentleHint();
    setFirstTryFailed(true);

    if (attemptsOnQuestion === 0) {
      setAttemptsOnQuestion(1);
      setFeedbackStatus('hint1');
      const msg = 'Em quan sát lại vị trí hai số trên tia số nhé!';
      setFeedbackMessage(msg);
      soundManager.speak(msg);
      setTimeout(() => setIsAnswerLocked(false), 600);
    } else {
      setAttemptsOnQuestion(2);
      setFeedbackStatus('hint2');
      const q = activeQuestion as FillSignQuestion;
      const signWord =
        q.correctSign === '>' ? 'lớn hơn (>)' : q.correctSign === '<' ? 'bé hơn (<)' : 'bằng (=)';
      const msg = `Vì ${q.numA} so với ${q.numB}, dấu đúng là ${signWord}. Cùng luyện tập một câu nhé!`;
      setFeedbackMessage(msg);
      soundManager.speak(msg);
    }
  };

  // -------------------------------------------------------------
  // CONTINUING TO NEXT QUESTION OR STAGE RESULTS
  // -------------------------------------------------------------

  const handleContinueAfterFeedback = () => {
    soundManager.playTap();

    // If currently showing attempt 2 demonstration, branch to practice question
    if (attemptsOnQuestion >= 2 && !isPractice && activeQuestion) {
      setResumeOriginalQuestion(activeQuestion);
      setIsPractice(true);

      let practiceQ: Question;
      if (activeQuestion.type === 'before_after') {
        practiceQ = generateBeforeAfterPractice(activeQuestion);
      } else if (activeQuestion.type === 'immediate') {
        practiceQ = generateImmediatePractice(activeQuestion);
      } else if (activeQuestion.type === 'compare_two_step' || activeQuestion.type === 'compare_direct') {
        practiceQ = generateComparePractice(activeQuestion);
      } else {
        practiceQ = generateFillSignPractice(activeQuestion);
      }

      setActiveQuestion(practiceQ);
      return;
    }

    // If currently on practice question, return to normal progress
    if (isPractice) {
      setIsPractice(false);
      setResumeOriginalQuestion(null);
      // Advance to next main question
      advanceNextMainQuestion();
      return;
    }

    // Normal advance
    advanceNextMainQuestion();
  };

  const advanceNextMainQuestion = () => {
    const nextIdx = currentQuestionIdx + 1;
    if (nextIdx < questions.length) {
      setCurrentQuestionIdx(nextIdx);
      setActiveQuestion(questions[nextIdx]);
    } else {
      // Completed all 5 questions for this stage!
      finishStage();
    }
  };

  const finishStage = () => {
    const finalStars = Math.max(stageStarsEarned, 5); // Each completed main question awards 1 star
    setProgressList((prev) => ({
      ...prev,
      [currentStageId]: {
        stageId: currentStageId,
        completed: true,
        stars: finalStars,
        firstTryCount: stageFirstTryCount,
        hintCount: stageHintCount,
      },
    }));
    setScreenState('stage_result');
  };

  // Reset entire progress for another student (Teacher button)
  const handleResetAll = () => {
    setProgressList(INITIAL_PROGRESS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // -------------------------------------------------------------
  // RENDER HELPERS
  // -------------------------------------------------------------

  const getStageTitle = (id: StageId): string => {
    switch (id) {
      case 1:
        return 'Chặng 1: Trước hay sau?';
      case 2:
        return 'Chặng 2: Liền trước – liền sau';
      case 3:
        return 'Chặng 3: Bé hơn – lớn hơn';
      case 4:
        return 'Chặng 4: Thử tài của bé';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col justify-between py-2 sm:py-4 px-2 sm:px-4">
      {/* 1. Opening Start Screen */}
      {screenState === 'start' && (
        <StartScreen
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onStartGame={handleStartGame}
          onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        />
      )}

      {/* 2. Stage Select Screen */}
      {screenState === 'stage_select' && (
        <StageSelect
          progressList={progressList}
          currentRecommendedStage={recommendedStageId}
          onSelectStage={startStage}
          onOpenTutorial={() => setShowTutorial(true)}
          onResetAll={handleResetAll}
          onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        />
      )}

      {/* 3. Main Playing Screen */}
      {screenState === 'playing' && activeQuestion && (
        <div className="w-full max-w-4xl mx-auto flex flex-col justify-between h-full min-h-[92vh]">
          {/* Top Bar Header */}
          <QuestionHeader
            stageTitle={getStageTitle(currentStageId)}
            questionNumber={currentQuestionIdx + 1}
            totalQuestions={questions.length}
            isPractice={isPractice}
            earnedStars={stageStarsEarned}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onHomeClick={() => setScreenState('stage_select')}
            onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
            onReplaySpeech={() => {
              if (activeQuestion.type === 'compare_two_step') {
                soundManager.speak(
                  twoStepStep === 1
                    ? activeQuestion.step1Prompt
                    : activeQuestion.step2Prompt
                );
              } else {
                soundManager.speak(
                  activeQuestion.speechText || activeQuestion.promptText
                );
              }
            }}
          />

          {/* Central Question Prompt Box */}
          <div className="bg-white rounded-2xl border-2 border-amber-200/90 shadow-sm p-3 sm:p-4 text-center mb-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-snug">
              {activeQuestion.type === 'compare_two_step' ? (
                twoStepStep === 1 ? (
                  activeQuestion.step1Prompt
                ) : (
                  activeQuestion.step2Prompt
                )
              ) : activeQuestion.type === 'fill_sign' ? (
                <div className="flex items-center justify-center gap-3">
                  <span>Điền dấu thích hợp:</span>
                  <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-xl border border-amber-300 text-3xl font-black text-slate-900">
                    <span>{activeQuestion.numA}</span>
                    <span className="w-10 h-10 border-2 border-dashed border-amber-500 rounded-lg flex items-center justify-center text-amber-600 bg-white">
                      ?
                    </span>
                    <span>{activeQuestion.numB}</span>
                  </div>
                </div>
              ) : (
                activeQuestion.promptText
              )}
            </h2>

            {/* Sub-instruction for 1st graders */}
            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
              {activeQuestion.type === 'before_after' && '👉 Chạm vào một số trên tia số'}
              {activeQuestion.type === 'immediate' && '👉 Chọn 1 trong 3 đáp án bên dưới'}
              {activeQuestion.type === 'compare_two_step' && '👉 Chạm vào một trong hai số đang sáng trên tia số'}
              {activeQuestion.type === 'compare_direct' && '👉 Chạm vào số đúng trên tia số'}
              {activeQuestion.type === 'fill_sign' && '👉 Chọn một dấu lớn hơn, bé hơn hoặc bằng'}
            </p>
          </div>

          {/* Central Hero: Number Line */}
          <div className="flex-1 flex flex-col justify-center py-1">
            <NumberLine
              bunnyPosition={bunnyPosition}
              bunnyExpression={bunnyExpr}
              referenceNumber={
                activeQuestion.type === 'before_after' || activeQuestion.type === 'immediate'
                  ? activeQuestion.referenceNumber
                  : null
              }
              highlightedNumbers={
                activeQuestion.type === 'compare_two_step'
                  ? [activeQuestion.numA, activeQuestion.numB]
                  : activeQuestion.type === 'compare_direct'
                  ? [activeQuestion.numA, activeQuestion.numB]
                  : activeQuestion.type === 'fill_sign'
                  ? activeQuestion.numA === activeQuestion.numB
                    ? [activeQuestion.numA]
                    : [activeQuestion.numA, activeQuestion.numB]
                  : []
              }
              selectedNumber={selectedNumber}
              correctNumber={correctDemonstrationNumber}
              dimNumbersAbove={
                activeQuestion.type === 'before_after'
                  ? activeQuestion.maxAllowedRange
                  : 10
              }
              interactiveNumbers={
                activeQuestion.type === 'compare_two_step'
                  ? [activeQuestion.numA, activeQuestion.numB]
                  : activeQuestion.type === 'compare_direct'
                  ? [activeQuestion.numA, activeQuestion.numB]
                  : activeQuestion.type === 'before_after'
                  ? undefined // all numbers 0..10 are clickable
                  : [] // not clickable in Stage 2 or fill_sign
              }
              glowRegion={glowRegion}
              glowRef={glowRef}
              arcTrajectory={arcTrajectory}
              onNumberTap={(num) => {
                if (activeQuestion.type === 'before_after') {
                  handleBeforeAfterTap(num);
                } else if (activeQuestion.type === 'compare_two_step') {
                  handleTwoStepTap(num);
                } else if (activeQuestion.type === 'compare_direct') {
                  handleCompareDirectTap(num);
                }
              }}
              disabled={isAnswerLocked || feedbackStatus === 'correct'}
            />
          </div>

          {/* Bottom Interactive Area (Options or Buttons) */}
          <div className="mt-2 min-h-[90px] flex flex-col items-center justify-center">
            
            {/* Stage 2 & 4: 3 Big Immediate Choice Buttons (min 60x60px) */}
            {activeQuestion.type === 'immediate' && (
              <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
                {activeQuestion.options.map((opt) => {
                  const isSelected = selectedNumber === opt;
                  const isDemonstrated = correctDemonstrationNumber === opt;

                  return (
                    <button
                      key={opt}
                      disabled={isAnswerLocked || feedbackStatus === 'correct'}
                      onClick={() => handleImmediateChoice(opt)}
                      aria-label={`Đáp án ${opt}`}
                      className={`
                        w-20 h-20 sm:w-24 sm:h-24 min-w-[70px] min-h-[70px]
                        rounded-2xl font-black text-3xl sm:text-4xl shadow-md
                        flex flex-col items-center justify-center
                        transition-all duration-150 transform touch-manipulation
                        ${
                          isDemonstrated
                            ? 'bg-emerald-500 text-white border-3 border-emerald-600 scale-105'
                            : isSelected
                            ? 'bg-blue-600 text-white border-3 border-blue-700'
                            : 'bg-white hover:bg-amber-50 border-3 border-slate-300 hover:border-amber-400 text-slate-800 active:scale-95'
                        }
                      `}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Stage 4: 3 Big Math Sign Buttons (>, <, =) */}
            {activeQuestion.type === 'fill_sign' && (
              <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
                {(['>', '<', '='] as const).map((sign) => {
                  const label =
                    sign === '>' ? 'Lớn hơn' : sign === '<' ? 'Bé hơn' : 'Bằng';
                  return (
                    <button
                      key={sign}
                      disabled={isAnswerLocked || feedbackStatus === 'correct'}
                      onClick={() => handleFillSignChoice(sign)}
                      aria-label={`Dấu ${label}`}
                      className="
                        w-24 h-20 sm:w-32 sm:h-24 min-w-[80px] min-h-[70px]
                        rounded-2xl font-black text-3xl sm:text-4xl shadow-md
                        flex flex-col items-center justify-center gap-0.5
                        bg-white hover:bg-amber-50 border-3 border-slate-300 hover:border-amber-400 text-slate-800
                        active:scale-95 transition-all duration-150 touch-manipulation
                      "
                    >
                      <span>{sign}</span>
                      <span className="text-xs font-extrabold text-slate-500 tracking-tight">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Feedback Banner with "Tiếp tục" button */}
            {feedbackStatus && feedbackMessage && (
              <FeedbackBanner
                status={feedbackStatus}
                message={feedbackMessage}
                onContinue={
                  feedbackStatus === 'correct' || attemptsOnQuestion >= 2
                    ? handleContinueAfterFeedback
                    : undefined
                }
                onRetry={
                  feedbackStatus === 'hint1'
                    ? () => {
                        soundManager.playTap();
                        setIsAnswerLocked(false);
                      }
                    : undefined
                }
                onReplaySpeech={() => soundManager.speak(feedbackMessage)}
                continueText={
                  attemptsOnQuestion >= 2 && !isPractice
                    ? 'Luyện tập câu này'
                    : 'Tiếp tục'
                }
              />
            )}
          </div>
        </div>
      )}

      {/* 4. Stage Completion Result Screen */}
      {screenState === 'stage_result' && (
        <StageResults
          stageId={currentStageId}
          progress={progressList[currentStageId]}
          onReplayStage={() => startStage(currentStageId)}
          onNextStage={() => {
            const nextStage = (currentStageId + 1) as StageId;
            if (nextStage <= 4) {
              startStage(nextStage);
            } else {
              setScreenState('stage_select');
            }
          }}
          onGoHome={() => setScreenState('stage_select')}
        />
      )}

      {/* Tutorial Overlay Modal */}
      {showTutorial && (
        <TutorialModal
          onComplete={() => {
            setShowTutorial(false);
            soundManager.playTap();
          }}
          onSkip={() => {
            setShowTutorial(false);
            soundManager.playTap();
          }}
        />
      )}

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />
    </div>
  );
}
