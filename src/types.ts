export type GameMode = 'single' | 'reverse' | 'two-player';
export type Screen = 'menu' | 'level-map' | 'game' | 'result' | 'two-player-setup';

export interface LevelResult {
  levelId: number;
  stars: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
}

export interface Question {
  a: number;
  b: number;
  answer: number;
  options: number[];
  isReverse: boolean;
}

export interface Progress {
  results: Record<number, LevelResult>;
  totalStars: number;
}

export interface PlayerState {
  name: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  currentQuestion: number;
  questions: Question[];
  answers: boolean[];
}

export const NUMBERS_1_TO_10 = Array.from({ length: 10 }, (_, i) => i + 1);
export const TOTAL_LEVELS = 100;
export const QUESTIONS_PER_LEVEL = 10;
export const QUESTIONS_PER_DUEL = 10;
