/**
 * Question generator for all 4 stages of "Bé Khám Phá Tia Số"
 * Strictly adheres to 1st grade math curriculum rules:
 * - Scope: 0 to 10
 * - Never ask immediate predecessor of 0 or immediate successor of 10
 * - Never ask for numbers before 0 or after 10
 * - Shuffles options, produces varied questions per round
 */

import {
  Question,
  BeforeAfterQuestion,
  ImmediateQuestion,
  CompareTwoStepQuestion,
  CompareDirectQuestion,
  FillSignQuestion,
  StageId,
} from '../types';

// Helper to shuffle arrays
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Random int between min and max inclusive
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick random element
function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Generate questions for Stage 1: "Trước hay sau?"
 * 5 questions total.
 * Q1-2: numbers in 0..5 (dim 6..10)
 * Q3-5: full range 0..10
 */
export function generateStage1Questions(): BeforeAfterQuestion[] {
  const questions: BeforeAfterQuestion[] = [];

  // Q1 & Q2: range 0..5
  // For 'before', ref must be >= 1 (e.g. 2, 3, 4, 5)
  // For 'after', ref must be <= 4 (e.g. 0, 1, 2, 3, 4)
  const q1Type: 'before' | 'after' = Math.random() > 0.5 ? 'before' : 'after';
  const q1Ref = q1Type === 'before' ? randomInt(2, 5) : randomInt(0, 3);
  questions.push({
    id: `s1_q1_${Date.now()}_1`,
    type: 'before_after',
    referenceNumber: q1Ref,
    subType: q1Type,
    maxAllowedRange: 5,
    promptText:
      q1Type === 'before'
        ? `Em hãy chạm vào một số đứng trước số ${q1Ref}.`
        : `Em hãy chạm vào một số đứng sau số ${q1Ref}.`,
    speechText:
      q1Type === 'before'
        ? `Em hãy chạm vào một số đứng trước số ${q1Ref}.`
        : `Em hãy chạm vào một số đứng sau số ${q1Ref}.`,
  });

  const q2Type: 'before' | 'after' = q1Type === 'before' ? 'after' : 'before';
  let q2Ref = q2Type === 'before' ? randomInt(2, 5) : randomInt(0, 3);
  if (q2Ref === q1Ref) q2Ref = q2Type === 'before' ? 4 : 2;
  questions.push({
    id: `s1_q2_${Date.now()}_2`,
    type: 'before_after',
    referenceNumber: q2Ref,
    subType: q2Type,
    maxAllowedRange: 5,
    promptText:
      q2Type === 'before'
        ? `Em hãy chạm vào một số đứng trước số ${q2Ref}.`
        : `Em hãy chạm vào một số đứng sau số ${q2Ref}.`,
    speechText:
      q2Type === 'before'
        ? `Em hãy chạm vào một số đứng trước số ${q2Ref}.`
        : `Em hãy chạm vào một số đứng sau số ${q2Ref}.`,
  });

  // Q3, Q4, Q5: range 0..10
  const usedRefs = new Set<number>([q1Ref, q2Ref]);
  const subTypes: ('before' | 'after')[] = shuffle(['before', 'after', Math.random() > 0.5 ? 'before' : 'after']);

  subTypes.forEach((subType, idx) => {
    let ref: number;
    let attempts = 0;
    do {
      ref = subType === 'before' ? randomInt(3, 10) : randomInt(0, 7);
      attempts++;
    } while (usedRefs.has(ref) && attempts < 10);
    usedRefs.add(ref);

    questions.push({
      id: `s1_q${idx + 3}_${Date.now()}_${idx + 3}`,
      type: 'before_after',
      referenceNumber: ref,
      subType,
      maxAllowedRange: 10,
      promptText:
        subType === 'before'
          ? `Em hãy chạm vào một số đứng trước số ${ref}.`
          : `Em hãy chạm vào một số đứng sau số ${ref}.`,
      speechText:
        subType === 'before'
          ? `Em hãy chạm vào một số đứng trước số ${ref}.`
          : `Em hãy chạm vào một số đứng sau số ${ref}.`,
    });
  });

  return questions;
}

/**
 * Generate 1 practice question for Before/After
 */
export function generateBeforeAfterPractice(original: BeforeAfterQuestion): BeforeAfterQuestion {
  const subType = original.subType;
  let ref = original.referenceNumber;
  if (subType === 'before') {
    ref = ref === 4 ? 6 : 4;
  } else {
    ref = ref === 5 ? 3 : 5;
  }
  return {
    id: `practice_${Date.now()}`,
    type: 'before_after',
    referenceNumber: ref,
    subType,
    maxAllowedRange: original.maxAllowedRange,
    isPractice: true,
    promptText:
      subType === 'before'
        ? `Câu luyện tập: Em hãy chạm vào một số đứng trước số ${ref}.`
        : `Câu luyện tập: Em hãy chạm vào một số đứng sau số ${ref}.`,
    speechText:
      subType === 'before'
        ? `Câu luyện tập: Em hãy chạm vào một số đứng trước số ${ref}.`
        : `Câu luyện tập: Em hãy chạm vào một số đứng sau số ${ref}.`,
  };
}

/**
 * Generate questions for Stage 2: "Liền trước – liền sau"
 * 5 questions total.
 * 3 choices, distinct, within 0-10.
 * Never ask predecessor of 0 or successor of 10.
 */
export function generateStage2Questions(): ImmediateQuestion[] {
  const configs: { subType: 'immediate_before' | 'immediate_after'; ref: number }[] = [
    { subType: 'immediate_before', ref: 6 }, // ans 5
    { subType: 'immediate_after', ref: 3 },  // ans 4
    { subType: 'immediate_before', ref: 9 }, // ans 8
    { subType: 'immediate_after', ref: 7 },  // ans 8
    { subType: Math.random() > 0.5 ? 'immediate_before' : 'immediate_after', ref: 4 },
  ];

  // Randomize some ref numbers to keep fresh
  const used = new Set<string>();
  const questions: ImmediateQuestion[] = [];

  configs.forEach((cfg, idx) => {
    let subType = cfg.subType;
    let ref = cfg.ref;

    // Pick ref safely
    if (subType === 'immediate_before') {
      ref = randomInt(1, 10);
    } else {
      ref = randomInt(0, 9);
    }

    const key = `${subType}_${ref}`;
    if (used.has(key)) {
      ref = subType === 'immediate_before' ? (ref > 1 ? ref - 1 : 10) : (ref < 9 ? ref + 1 : 0);
    }
    used.add(`${subType}_${ref}`);

    const correct = subType === 'immediate_before' ? ref - 1 : ref + 1;

    // Generate 2 distractors
    // One distractor is in the same direction (e.g. Standing before, but not immediate)
    const distractors = new Set<number>();

    if (subType === 'immediate_before') {
      if (ref - 2 >= 0) distractors.add(ref - 2);
      if (ref + 1 <= 10) distractors.add(ref + 1);
    } else {
      if (ref + 2 <= 10) distractors.add(ref + 2);
      if (ref - 1 >= 0) distractors.add(ref - 1);
    }

    // Fill remaining if needed
    for (let n = 0; n <= 10; n++) {
      if (distractors.size >= 2) break;
      if (n !== correct && n !== ref) {
        distractors.add(n);
      }
    }

    const options = shuffle([correct, ...Array.from(distractors).slice(0, 2)]);

    const isBefore = subType === 'immediate_before';
    const prompt = isBefore
      ? `Số nào liền trước số ${ref}?`
      : `Số nào liền sau số ${ref}?`;

    questions.push({
      id: `s2_q${idx + 1}_${Date.now()}_${idx}`,
      type: 'immediate',
      referenceNumber: ref,
      subType,
      correctAnswer: correct,
      options,
      promptText: prompt,
      speechText: prompt,
    });
  });

  return shuffle(questions);
}

/**
 * Generate 1 practice question for Immediate Predecessor/Successor
 */
export function generateImmediatePractice(original: ImmediateQuestion): ImmediateQuestion {
  const isBefore = original.subType === 'immediate_before';
  const newRef = isBefore
    ? (original.referenceNumber === 5 ? 7 : 5)
    : (original.referenceNumber === 6 ? 4 : 6);
  const correct = isBefore ? newRef - 1 : newRef + 1;

  const distractors: number[] = isBefore
    ? [newRef - 2 >= 0 ? newRef - 2 : 0, newRef + 1 <= 10 ? newRef + 1 : 2]
    : [newRef + 2 <= 10 ? newRef + 2 : 10, newRef - 1 >= 0 ? newRef - 1 : 8];

  const options = shuffle([correct, distractors[0], distractors[1]]);
  const prompt = isBefore
    ? `Câu luyện tập: Số nào liền trước số ${newRef}?`
    : `Câu luyện tập: Số nào liền sau số ${newRef}?`;

  return {
    id: `practice_${Date.now()}`,
    type: 'immediate',
    referenceNumber: newRef,
    subType: original.subType,
    correctAnswer: correct,
    options,
    isPractice: true,
    promptText: prompt,
    speechText: prompt,
  };
}

/**
 * Generate questions for Stage 3: "Bé hơn – lớn hơn"
 * 5 questions total.
 * First 2 questions: Two-step questions:
 *   Step 1: "Số nào đứng trước?" -> Step 2: "Vậy số nào bé hơn?"
 *   Or Step 1: "Số nào đứng sau?" -> Step 2: "Vậy số nào lớn hơn?"
 * Next 3 questions: Direct comparisons:
 *   "Giữa A và B, số nào bé hơn/lớn hơn?"
 */
export function generateStage3Questions(): (CompareTwoStepQuestion | CompareDirectQuestion)[] {
  const questions: (CompareTwoStepQuestion | CompareDirectQuestion)[] = [];

  // Q1: Two-step (standing before -> smaller)
  // Pick pair (e.g. 2 and 6)
  const p1A = 2;
  const p1B = 6;
  questions.push({
    id: `s3_q1_${Date.now()}`,
    type: 'compare_two_step',
    numA: p1A,
    numB: p1B,
    currentStep: 1,
    step1Target: 'before',
    step2Target: 'smaller',
    step1Prompt: `Quan sát hai số ${p1A} và ${p1B} trên tia số. Số nào đứng trước?`,
    step2Prompt: `Vì số ${p1A} đứng trước số ${p1B}, vậy số nào bé hơn?`,
    step1Correct: p1A,
    step2Correct: p1A,
    promptText: `Quan sát hai số ${p1A} và ${p1B} trên tia số. Số nào đứng trước?`,
    speechText: `Quan sát hai số ${p1A} và ${p1B} trên tia số. Số nào đứng trước?`,
  });

  // Q2: Two-step (standing after -> larger)
  // Pick pair (e.g. 4 and 8)
  const p2A = 4;
  const p2B = 8;
  questions.push({
    id: `s3_q2_${Date.now()}`,
    type: 'compare_two_step',
    numA: p2A,
    numB: p2B,
    currentStep: 1,
    step1Target: 'after',
    step2Target: 'larger',
    step1Prompt: `Quan sát hai số ${p2A} và ${p2B} trên tia số. Số nào đứng sau?`,
    step2Prompt: `Vì số ${p2B} đứng sau số ${p2A}, vậy số nào lớn hơn?`,
    step1Correct: p2B,
    step2Correct: p2B,
    promptText: `Quan sát hai số ${p2A} và ${p2B} trên tia số. Số nào đứng sau?`,
    speechText: `Quan sát hai số ${p2A} và ${p2B} trên tia số. Số nào đứng sau?`,
  });

  // Q3, Q4, Q5: Direct questions
  // Variations with randomized order of mention
  const directPairs: { a: number; b: number; target: 'smaller' | 'larger' }[] = [
    { a: 3, b: 7, target: 'smaller' },
    { a: 8, b: 5, target: 'larger' },
    { a: 1, b: 9, target: Math.random() > 0.5 ? 'smaller' : 'larger' },
  ];

  directPairs.forEach((pair, idx) => {
    // Randomize whether a or b is mentioned first
    const swap = Math.random() > 0.5;
    const first = swap ? pair.b : pair.a;
    const second = swap ? pair.a : pair.b;
    const smaller = Math.min(pair.a, pair.b);
    const larger = Math.max(pair.a, pair.b);
    const correct = pair.target === 'smaller' ? smaller : larger;
    const targetWord = pair.target === 'smaller' ? 'bé hơn' : 'lớn hơn';

    const prompt = `Giữa ${first} và ${second}, số nào ${targetWord}?`;

    questions.push({
      id: `s3_q${idx + 3}_${Date.now()}_${idx}`,
      type: 'compare_direct',
      numA: Math.min(pair.a, pair.b),
      numB: Math.max(pair.a, pair.b),
      target: pair.target,
      firstMentioned: first,
      secondMentioned: second,
      correctAnswer: correct,
      promptText: prompt,
      speechText: prompt,
    });
  });

  return questions;
}

export function generateComparePractice(
  original: CompareTwoStepQuestion | CompareDirectQuestion
): CompareDirectQuestion {
  const isSmaller =
    original.type === 'compare_direct'
      ? original.target === 'smaller'
      : original.step2Target === 'smaller';

  const a = isSmaller ? 2 : 4;
  const b = isSmaller ? 5 : 9;
  const target = isSmaller ? 'smaller' : 'larger';
  const correct = isSmaller ? Math.min(a, b) : Math.max(a, b);
  const targetWord = isSmaller ? 'bé hơn' : 'lớn hơn';

  const prompt = `Câu luyện tập: Giữa ${a} và ${b}, số nào ${targetWord}?`;

  return {
    id: `practice_${Date.now()}`,
    type: 'compare_direct',
    numA: Math.min(a, b),
    numB: Math.max(a, b),
    target,
    firstMentioned: a,
    secondMentioned: b,
    correctAnswer: correct,
    isPractice: true,
    promptText: prompt,
    speechText: prompt,
  };
}

/**
 * Generate questions for Stage 4: "Thử tài của bé"
 * 5 questions total:
 * - 1 before/after
 * - 1 immediate predecessor/successor
 * - 1 compare smaller/larger
 * - 2 fill sign >, <, =
 */
export function generateStage4Questions(): Question[] {
  const questions: Question[] = [];

  // 1. Before or After
  const s1Type: 'before' | 'after' = Math.random() > 0.5 ? 'before' : 'after';
  const s1Ref = s1Type === 'before' ? randomInt(4, 8) : randomInt(2, 6);
  questions.push({
    id: `s4_q1_${Date.now()}`,
    type: 'before_after',
    referenceNumber: s1Ref,
    subType: s1Type,
    maxAllowedRange: 10,
    promptText:
      s1Type === 'before'
        ? `Em hãy chạm vào một số đứng trước số ${s1Ref}.`
        : `Em hãy chạm vào một số đứng sau số ${s1Ref}.`,
    speechText:
      s1Type === 'before'
        ? `Em hãy chạm vào một số đứng trước số ${s1Ref}.`
        : `Em hãy chạm vào một số đứng sau số ${s1Ref}.`,
  });

  // 2. Immediate
  const s2Type: 'immediate_before' | 'immediate_after' =
    Math.random() > 0.5 ? 'immediate_before' : 'immediate_after';
  const s2Ref = s2Type === 'immediate_before' ? randomInt(2, 9) : randomInt(1, 8);
  const s2Correct = s2Type === 'immediate_before' ? s2Ref - 1 : s2Ref + 1;
  const dist1 = s2Type === 'immediate_before' ? s2Ref + 1 : s2Ref - 1;
  const dist2 = (s2Correct + 3) % 11;
  const s2Options = shuffle([s2Correct, dist1, dist2 === s2Correct ? 0 : dist2]);

  questions.push({
    id: `s4_q2_${Date.now()}`,
    type: 'immediate',
    referenceNumber: s2Ref,
    subType: s2Type,
    correctAnswer: s2Correct,
    options: s2Options,
    promptText:
      s2Type === 'immediate_before'
        ? `Số nào liền trước số ${s2Ref}?`
        : `Số nào liền sau số ${s2Ref}?`,
    speechText:
      s2Type === 'immediate_before'
        ? `Số nào liền trước số ${s2Ref}?`
        : `Số nào liền sau số ${s2Ref}?`,
  });

  // 3. Compare direct
  const cTarget: 'smaller' | 'larger' = Math.random() > 0.5 ? 'smaller' : 'larger';
  const cA = randomInt(1, 4);
  const cB = randomInt(5, 9);
  const cCorrect = cTarget === 'smaller' ? cA : cB;
  const cWord = cTarget === 'smaller' ? 'bé hơn' : 'lớn hơn';
  const cSwap = Math.random() > 0.5;
  const cFirst = cSwap ? cB : cA;
  const cSecond = cSwap ? cA : cB;
  questions.push({
    id: `s4_q3_${Date.now()}`,
    type: 'compare_direct',
    numA: cA,
    numB: cB,
    target: cTarget,
    firstMentioned: cFirst,
    secondMentioned: cSecond,
    correctAnswer: cCorrect,
    promptText: `Giữa ${cFirst} và ${cSecond}, số nào ${cWord}?`,
    speechText: `Giữa ${cFirst} và ${cSecond}, số nào ${cWord}?`,
  });

  // 4 & 5. Fill sign questions (ensure at least 2 different relations, e.g. < and =, or > and <)
  const signScenarios: { a: number; b: number; sign: '>' | '<' | '=' }[] = [
    { a: 3, b: 8, sign: '<' },
    { a: 7, b: 2, sign: '>' },
    { a: 5, b: 5, sign: '=' },
    { a: 6, b: 9, sign: '<' },
    { a: 4, b: 4, sign: '=' },
  ];
  const pickedScenarios = shuffle(signScenarios).slice(0, 2);

  pickedScenarios.forEach((sc, idx) => {
    questions.push({
      id: `s4_sign_${idx + 1}_${Date.now()}`,
      type: 'fill_sign',
      numA: sc.a,
      numB: sc.b,
      correctSign: sc.sign,
      promptText: `Điền dấu thích hợp vào ô trống: ${sc.a} □ ${sc.b}`,
      speechText: `Điền dấu lớn hơn, bé hơn, hoặc bằng vào ô trống: ${sc.a} so với ${sc.b}`,
    });
  });

  return questions;
}

export function generateFillSignPractice(original: FillSignQuestion): FillSignQuestion {
  let a = 4;
  let b = 6;
  let sign: '>' | '<' | '=' = '<';
  if (original.correctSign === '<') {
    a = 7;
    b = 3;
    sign = '>';
  } else if (original.correctSign === '>') {
    a = 6;
    b = 6;
    sign = '=';
  } else {
    a = 2;
    b = 5;
    sign = '<';
  }

  return {
    id: `practice_${Date.now()}`,
    type: 'fill_sign',
    numA: a,
    numB: b,
    correctSign: sign,
    isPractice: true,
    promptText: `Câu luyện tập: Điền dấu thích hợp: ${a} □ ${b}`,
    speechText: `Câu luyện tập: Điền dấu thích hợp: ${a} so với ${b}`,
  };
}

/**
 * Stage dispatcher
 */
export function getQuestionsForStage(stageId: StageId): Question[] {
  switch (stageId) {
    case 1:
      return generateStage1Questions();
    case 2:
      return generateStage2Questions();
    case 3:
      return generateStage3Questions();
    case 4:
      return generateStage4Questions();
  }
}
