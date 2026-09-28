import type { Question } from '@/types';
import { QUESTIONS_PER_LEVEL } from '@/types';

export function generateQuestions(
  number: number,
  level: number,
  isReverse: boolean
): Question[] {
  const questions: Question[] = [];
  const used = new Set<string>();

  while (questions.length < QUESTIONS_PER_LEVEL) {
    const b = Math.floor(Math.random() * 10) + 1;
    const key = `${number}-${b}`;
    if (used.has(key)) continue;
    used.add(key);

    const answer = number * b;
    const options = generateOptions(answer);

    if (isReverse) {
      questions.push({ a: answer, b: number, answer: b, options, isReverse: true });
    } else {
      questions.push({ a: number, b, answer, options, isReverse: false });
    }
  }

  return shuffle(questions);
}

function generateOptions(correct: number): number[] {
  const options = new Set<number>([correct]);
  while (options.size < 4) {
    const delta = Math.floor(Math.random() * 10) - 5;
    if (delta === 0) continue;
    const wrong = correct + delta;
    if (wrong > 0) options.add(wrong);
  }
  return shuffle([...options]);
}

export function generateTwoPlayerQuestions(count: number): Question[] {
  const questions: Question[] = [];
  const used = new Set<string>();

  while (questions.length < count) {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const key = `${a}-${b}`;
    if (used.has(key)) continue;
    used.add(key);
    questions.push({ a, b, answer: a * b, options: [], isReverse: false });
  }

  return questions;
}

export function generateSeparateQuestionSets(count: number): { p1: Question[]; p2: Question[] } {
  return {
    p1: generateTwoPlayerQuestions(count),
    p2: generateTwoPlayerQuestions(count),
  };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function toPersianDigits(n: number | string): string {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/\d/g, (d) => persian[parseInt(d)]);
}

export function calculateStars(correctCount: number, total: number): number {
  const ratio = correctCount / total;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}
