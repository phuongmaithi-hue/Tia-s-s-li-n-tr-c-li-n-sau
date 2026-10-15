/**
 * Types for "Bé Khám Phá Tia Số" - Lớp 1
 */

export type StageId = 1 | 2 | 3 | 4;

export type QuestionType =
  | 'before_after'       // Stage 1 & Stage 4
  | 'immediate'          // Stage 2 & Stage 4 (liền trước / liền sau)
  | 'compare_two_step'   // Stage 3 (Step 1: đứng trước/sau -> Step 2: bé hơn/lớn hơn)
  | 'compare_direct'     // Stage 3 & Stage 4 (Giữa A và B, số nào bé hơn / lớn hơn)
  | 'fill_sign';         // Stage 4 (Điền dấu >, <, =)

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  promptText: string;
  speechText?: string;
  referenceNumber?: number; // e.g. 4
  subType?: 'before' | 'after' | 'immediate_before' | 'immediate_after';
  isPractice?: boolean;
}

export interface BeforeAfterQuestion extends BaseQuestion {
  type: 'before_after';
  referenceNumber: number;
  subType: 'before' | 'after';
  maxAllowedRange: number; // 5 for first 2 questions, 10 for rest
}

export interface ImmediateQuestion extends BaseQuestion {
  type: 'immediate';
  referenceNumber: number;
  subType: 'immediate_before' | 'immediate_after';
  options: number[]; // 3 distinct options
  correctAnswer: number;
}

export interface CompareTwoStepQuestion extends BaseQuestion {
  type: 'compare_two_step';
  numA: number;
  numB: number;
  currentStep: 1 | 2;
  step1Target: 'before' | 'after';
  step2Target: 'smaller' | 'larger';
  step1Prompt: string;
  step2Prompt: string;
  step1Correct: number;
  step2Correct: number;
}

export interface CompareDirectQuestion extends BaseQuestion {
  type: 'compare_direct';
  numA: number;
  numB: number;
  target: 'smaller' | 'larger';
  firstMentioned: number;
  secondMentioned: number;
  correctAnswer: number;
}

export interface FillSignQuestion extends BaseQuestion {
  type: 'fill_sign';
  numA: number;
  numB: number;
  correctSign: '>' | '<' | '=';
}

export type Question =
  | BeforeAfterQuestion
  | ImmediateQuestion
  | CompareTwoStepQuestion
  | CompareDirectQuestion
  | FillSignQuestion;

export interface QuestionResult {
  questionId: string;
  firstTrySuccess: boolean;
  neededHint: boolean;
}

export interface StageProgress {
  stageId: StageId;
  completed: boolean;
  stars: number;
  firstTryCount: number;
  hintCount: number;
}

export type ScreenState =
  | 'start'
  | 'stage_select'
  | 'tutorial'
  | 'playing'
  | 'stage_result';
