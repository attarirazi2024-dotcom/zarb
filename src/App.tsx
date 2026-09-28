import { useState, useCallback, useMemo } from 'react';
import type { GameMode, Screen, Question, Progress, LevelResult } from '@/types';
import { TOTAL_LEVELS } from '@/types';
import { generateQuestions, generateSeparateQuestionSets, calculateStars } from '@/utils/game';
import { MainMenu } from '@/components/MainMenu';
import { LevelMap } from '@/components/LevelMap';
import { GameScreen } from '@/components/GameScreen';
import { ResultScreen } from '@/components/ResultScreen';
import { TwoPlayerSetup } from '@/components/TwoPlayerSetup';
import { TwoPlayerDuel } from '@/components/TwoPlayerDuel';

const STORAGE_KEY = 'multiplication-game-progress';

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { results: parsed.results ?? {}, totalStars: parsed.totalStars ?? 0 };
    }
  } catch {
    // ignore
  }
  return { results: {}, totalStars: 0 };
}

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

function getLevelInfo(levelId: number): { number: number; step: number } {
  const number = Math.ceil(levelId / 10);
  const step = ((levelId - 1) % 10) + 1;
  return { number, step };
}

function levelTitle(levelId: number): string {
  const { number, step } = getLevelInfo(levelId);
  return `ضرب ${number} - مرحله ${step}`;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [mode, setMode] = useState<GameMode>('single');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [result, setResult] = useState<{ correct: number; total: number; score: number } | null>(null);

  // Two-player state
  const [tpP1Questions, setTpP1Questions] = useState<Question[]>([]);
  const [tpP2Questions, setTpP2Questions] = useState<Question[]>([]);
  const [tpNames, setTpNames] = useState<{ p1: string; p2: string }>({ p1: '', p2: '' });

  const handleSelectMode = useCallback((m: GameMode) => {
    setMode(m);
    if (m === 'two-player') {
      setScreen('two-player-setup');
    } else {
      setScreen('level-map');
    }
  }, []);

  const handleSelectLevel = useCallback(
    (levelId: number) => {
      const { number, step } = getLevelInfo(levelId);
      const qs = generateQuestions(number, step, mode === 'reverse');
      setQuestions(qs);
      setCurrentLevel(levelId);
      setScreen('game');
    },
    [mode]
  );

  const handleGameComplete = useCallback(
    (correctCount: number, _answers: boolean[]) => {
      void _answers;
      const total = questions.length;
      const stars = calculateStars(correctCount, total);
      const score = correctCount * 10 + stars * 5;

      const levelResult: LevelResult = {
        levelId: currentLevel,
        stars,
        score,
        correctCount,
        totalQuestions: total,
      };

      setProgress((prev) => {
        const existing = prev.results[currentLevel];
        const bestStars = Math.max(existing?.stars ?? 0, stars);
        const bestScore = Math.max(existing?.score ?? 0, score);
        const newResults = {
          ...prev.results,
          [currentLevel]: { ...levelResult, stars: bestStars, score: bestScore },
        };
        const totalStars = Object.values(newResults).reduce((sum, r) => sum + r.stars, 0);
        const newProgress = { results: newResults, totalStars };
        saveProgress(newProgress);
        return newProgress;
      });

      setResult({ correct: correctCount, total, score });
    },
    [questions.length, currentLevel]
  );

  const handleRetry = useCallback(() => {
    const { number, step } = getLevelInfo(currentLevel);
    const qs = generateQuestions(number, step, mode === 'reverse');
    setQuestions(qs);
    setResult(null);
    setScreen('game');
  }, [currentLevel, mode]);

  const handleNext = useCallback(() => {
    if (currentLevel < TOTAL_LEVELS) {
      const nextLevel = currentLevel + 1;
      const { number, step } = getLevelInfo(nextLevel);
      const qs = generateQuestions(number, step, mode === 'reverse');
      setQuestions(qs);
      setCurrentLevel(nextLevel);
      setResult(null);
      setScreen('game');
    }
  }, [currentLevel, mode]);

  const handleHome = useCallback(() => {
    setResult(null);
    setScreen('menu');
  }, []);

  const handleBackToMap = useCallback(() => {
    setResult(null);
    setScreen('level-map');
  }, []);

  const handleStartTwoPlayer = useCallback((p1: string, p2: string, count: number) => {
    const sets = generateSeparateQuestionSets(count);
    setTpP1Questions(sets.p1);
    setTpP2Questions(sets.p2);
    setTpNames({ p1, p2 });
    setScreen('game');
  }, []);

  const handleTwoPlayerComplete = useCallback(() => {
    // Result shown inside TwoPlayerDuel
  }, []);

  const hasNext = useMemo(() => {
    if (currentLevel >= TOTAL_LEVELS) return false;
    const prevPassed = progress.results[currentLevel];
    return !!prevPassed;
  }, [currentLevel, progress.results]);

  if (screen === 'menu') {
    return <MainMenu onSelectMode={handleSelectMode} totalStars={progress.totalStars} />;
  }

  if (screen === 'level-map') {
    return (
      <LevelMap
        mode={mode === 'reverse' ? 'reverse' : 'single'}
        progress={progress}
        onSelectLevel={handleSelectLevel}
        onBack={handleHome}
      />
    );
  }

  if (screen === 'two-player-setup') {
    return <TwoPlayerSetup onStart={handleStartTwoPlayer} onBack={handleHome} />;
  }

  if (screen === 'game') {
    // Two-player mode
    if (mode === 'two-player' && tpP1Questions.length > 0) {
      return (
        <TwoPlayerDuel
          p1Questions={tpP1Questions}
          p2Questions={tpP2Questions}
          p1Name={tpNames.p1}
          p2Name={tpNames.p2}
          onComplete={handleTwoPlayerComplete}
          onExit={handleHome}
        />
      );
    }

    // Single / reverse mode
    if (questions.length > 0 && !result) {
      return (
        <GameScreen
          questions={questions}
          levelId={currentLevel}
          levelTitle={levelTitle(currentLevel)}
          onComplete={handleGameComplete}
          onExit={handleBackToMap}
        />
      );
    }

    if (result) {
      return (
        <ResultScreen
          correctCount={result.correct}
          totalQuestions={result.total}
          score={result.score}
          levelTitle={levelTitle(currentLevel)}
          onRetry={handleRetry}
          onNext={handleNext}
          onHome={handleBackToMap}
          hasNext={hasNext}
        />
      );
    }
  }

  return <MainMenu onSelectMode={handleSelectMode} totalStars={progress.totalStars} />;
}
