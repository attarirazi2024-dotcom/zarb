import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Trophy, Heart, Flame, Timer, Zap } from 'lucide-react';
import type { Question } from '@/types';
import { toPersianDigits } from '@/utils/game';
import { playSound } from '@/utils/sound';
import { NumberPad } from '@/components/NumberPad';
import { Mascot } from '@/components/Mascot';
import { Confetti } from '@/components/Confetti';

interface TwoPlayerDuelProps {
  p1Questions: Question[];
  p2Questions: Question[];
  p1Name: string;
  p2Name: string;
  onComplete: (p1Correct: number, p2Correct: number) => void;
  onExit: () => void;
}

type Phase = 'p1-intro' | 'p1-play' | 'p1-done' | 'p2-intro' | 'p2-play' | 'p2-done' | 'result';

export function TwoPlayerDuel({ p1Questions, p2Questions, p1Name, p2Name, onComplete, onExit }: TwoPlayerDuelProps) {
  const [phase, setPhase] = useState<Phase>('p1-intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [p1Correct, setP1Correct] = useState(0);
  const [p2Correct, setP2Correct] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [floatText, setFloatText] = useState<{ text: string; color: string; id: number } | null>(null);
  const [wrongShake, setWrongShake] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'sad' | 'excited' | 'thinking'>('idle');
  const [padDisabled, setPadDisabled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerCount = useRef(0);

  const isP1Turn = phase === 'p1-play';
  const activeQuestions = isP1Turn ? p1Questions : p2Questions;
  const question = activeQuestions[currentQ];
  const playerName = isP1Turn ? p1Name : p2Name;

  // Timer
  useEffect(() => {
    if (phase !== 'p1-play' && phase !== 'p2-play') return;
    if (feedback !== null) return;
    setTimeLeft(15);
    setMascotMood('thinking');

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ, feedback, phase]);

  const handleTimeout = useCallback(() => {
    if (feedback !== null) return;
    setFeedback('wrong');
    setLives((l) => l - 1);
    setStreak(0);
    setMascotMood('sad');
    setWrongShake(true);
    setPadDisabled(true);
    playSound('wrong');
    setTimeout(() => setWrongShake(false), 500);
    setTimeout(() => goToNext(false), 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  const goToNext = useCallback(
    (_isCorrect: boolean) => {
      void _isCorrect;
      setFeedback(null);
      setPadDisabled(false);

      const newCount = answerCount.current + 1;
      answerCount.current = newCount;

      if (newCount >= activeQuestions.length) {
        if (phase === 'p1-play') {
          setPhase('p1-done');
        } else {
          setPhase('p2-done');
        }
      } else {
        setCurrentQ((i) => i + 1);
      }
    },
    [activeQuestions.length, phase]
  );

  const handleAnswer = useCallback(
    (value: number) => {
      if (feedback !== null || !question) return;
      if (timerRef.current) clearInterval(timerRef.current);

      const isCorrect = value === question.answer;
      setFeedback(isCorrect ? 'correct' : 'wrong');
      setPadDisabled(true);

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setMascotMood(newStreak >= 3 ? 'excited' : 'happy');
        if (isP1Turn) setP1Correct((c) => c + 1);
        else setP2Correct((c) => c + 1);
        playSound('correct');

        const messages = ['آفرین!', 'عالی!', 'حله!', 'درست!'];
        setFloatText({ text: messages[Math.floor(Math.random() * messages.length)], color: 'text-success-500', id: Date.now() });
      } else {
        setLives((l) => l - 1);
        setStreak(0);
        setMascotMood('sad');
        setWrongShake(true);
        playSound('wrong');
        setTimeout(() => setWrongShake(false), 500);
        setFloatText({ text: 'نه!', color: 'text-error-500', id: Date.now() });
      }

      setTimeout(() => goToNext(isCorrect), 1400);
    },
    [feedback, question, streak, isP1Turn, goToNext]
  );

  const startP2 = () => {
    setCurrentQ(0);
    setLives(3);
    setStreak(0);
    setFeedback(null);
    setPadDisabled(false);
    answerCount.current = 0;
    setPhase('p2-intro');
  };

  const startPlay = () => {
    setLives(3);
    setCurrentQ(0);
    setStreak(0);
    setFeedback(null);
    setPadDisabled(false);
    answerCount.current = 0;
    setPhase(phase === 'p1-intro' ? 'p1-play' : 'p2-play');
  };

  const showResult = () => {
    setPhase('result');
    onComplete(p1Correct, p2Correct);
    playSound('win');
  };

  useEffect(() => {
    if (phase === 'p1-done' || phase === 'p2-done') {
      playSound('star');
    }
  }, [phase]);

  // Intro screens
  if (phase === 'p1-intro' || phase === 'p2-intro') {
    const name = phase === 'p1-intro' ? p1Name : p2Name;
    const color = phase === 'p1-intro' ? 'from-brand-500 to-brand-700' : 'from-success-500 to-success-700';
    const qCount = phase === 'p1-intro' ? p1Questions.length : p2Questions.length;
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-6">
        <div className={`bg-gradient-to-br ${color} text-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounceIn`}>
          <div className="flex justify-center mb-4">
            <Mascot mood="excited" size={70} />
          </div>
          <h2 className="text-2xl font-black mb-2">{name}</h2>
          <p className="text-white/80 mb-6">نوبت توست! آماده‌ای؟</p>
          <div className="bg-white/20 rounded-2xl p-4 mb-6">
            <p className="text-sm text-white/80 mb-1">تعداد سؤالات</p>
            <p className="text-3xl font-black">{toPersianDigits(qCount)}</p>
          </div>
          <button
            onClick={startPlay}
            className="w-full h-14 bg-white text-gray-800 rounded-2xl font-bold text-xl active:scale-95 transition shadow-lg"
          >
            شروع!
          </button>
        </div>
        <button onClick={onExit} className="mt-4 text-gray-400 flex items-center gap-1 hover:text-gray-600 transition">
          <X size={18} />
          خروج
        </button>
      </div>
    );
  }

  // Turn done screens
  if (phase === 'p1-done' || phase === 'p2-done') {
    const name = phase === 'p1-done' ? p1Name : p2Name;
    const correct = phase === 'p1-done' ? p1Correct : p2Correct;
    const total = phase === 'p1-done' ? p1Questions.length : p2Questions.length;
    const color = phase === 'p1-done' ? 'from-brand-500 to-brand-700' : 'from-success-500 to-success-700';
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-6">
        <Confetti active count={40} />
        <div className={`bg-gradient-to-br ${color} text-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounceIn`}>
          <div className="flex justify-center mb-4">
            <Mascot mood="happy" size={70} />
          </div>
          <h2 className="text-xl font-bold mb-1">{name}</h2>
          <p className="text-white/70 text-sm mb-4">نوبت تو تمام شد!</p>
          <div className="bg-white/20 rounded-2xl p-6 mb-6">
            <p className="text-sm text-white/80 mb-1">پاسخ‌های درست</p>
            <p className="text-5xl font-black">{toPersianDigits(correct)}</p>
            <p className="text-sm text-white/80 mt-1">از {toPersianDigits(total)}</p>
          </div>
          {phase === 'p1-done' ? (
            <button onClick={startP2} className="w-full h-14 bg-white text-gray-800 rounded-2xl font-bold text-xl active:scale-95 transition shadow-lg">
              نوبت {p2Name}
            </button>
          ) : (
            <button onClick={showResult} className="w-full h-14 bg-white text-gray-800 rounded-2xl font-bold text-xl active:scale-95 transition shadow-lg">
              نتیجه نهایی
            </button>
          )}
        </div>
      </div>
    );
  }

  // Final result
  if (phase === 'result') {
    const winner = p1Correct > p2Correct ? p1Name : p2Correct > p1Correct ? p2Name : null;
    const isTie = p1Correct === p2Correct;
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-6">
        <Confetti active={!isTie} count={80} />
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-bounceIn">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-warning-300 to-warning-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Trophy size={40} className="text-white" />
          </div>
          {isTie ? (
            <>
              <h2 className="text-2xl font-black text-gray-800 mb-2">مساوی!</h2>
              <p className="text-gray-500 mb-4">هر دو عالی بودید!</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-gray-800 mb-1">برنده!</h2>
              <p className="text-lg font-bold text-warning-600 mb-4">{winner}</p>
            </>
          )}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <PlayerResult name={p1Name} correct={p1Correct} total={p1Questions.length} color="brand" isWinner={!isTie && winner === p1Name} />
            <PlayerResult name={p2Name} correct={p2Correct} total={p2Questions.length} color="success" isWinner={!isTie && winner === p2Name} />
          </div>
          <button onClick={onExit} className="w-full h-14 bg-gradient-to-l from-brand-500 to-brand-600 text-white rounded-2xl font-bold text-lg active:scale-95 transition shadow-lg">
            بازگشت به خانه
          </button>
        </div>
      </div>
    );
  }

  // Playing
  if (!question) return null;

  const headerColor = isP1Turn ? 'from-brand-500 to-brand-600' : 'from-success-500 to-success-600';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-l ${headerColor} text-white px-4 py-3 flex items-center justify-between shadow-md`}>
        <button onClick={onExit} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition active:scale-90">
          <X size={20} />
        </button>
        <div className="text-center">
          <p className="font-bold">{playerName}</p>
          <p className="text-xs text-white/80">
            سؤال {toPersianDigits(currentQ + 1)} از {toPersianDigits(activeQuestions.length)}
          </p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <Heart key={i} size={22} className={i < lives ? 'fill-white text-white' : 'text-white/30'} />
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between border-b border-gray-100">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${timeLeft <= 5 ? 'bg-error-100 text-error-600' : isP1Turn ? 'bg-brand-100 text-brand-600' : 'bg-success-100 text-success-600'}`}>
          <Timer size={16} className={timeLeft <= 5 ? 'animate-pulse' : ''} />
          <span className="font-bold text-sm">{toPersianDigits(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent-100 text-accent-600">
          <Flame size={16} className={streak >= 3 ? 'animate-wiggle' : ''} />
          <span className="font-bold text-sm">{toPersianDigits(streak)}</span>
        </div>
        <div className="flex-1 mx-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 rounded-full"
            style={{ width: `${(currentQ / activeQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        {/* Mascot */}
        <div className="mb-3">
          <Mascot mood={mascotMood} size={60} message={
            feedback !== null ? undefined : mascotMood === 'thinking' ? 'فکر کن...' : undefined
          } />
        </div>

        {/* Question card - left aligned so answer is on the right */}
        <div
          className={`bg-white rounded-3xl shadow-xl px-6 py-8 w-full max-w-md ${
            wrongShake ? 'animate-shake' : ''
          } ${feedback === 'correct' ? 'ring-4 ring-success-300' : ''} ${feedback === 'wrong' ? 'ring-4 ring-error-300' : ''} transition-all`}
        >
          <div className="relative">
            {floatText && (
              <div
                key={floatText.id}
                className={`absolute -top-6 left-1/2 -translate-x-1/2 ${floatText.color} font-black text-2xl animate-floatUp pointer-events-none`}
              >
                {floatText.text}
              </div>
            )}
            <p className="text-sm text-gray-400 mb-4 font-medium text-center">حاصل ضرب را حساب کن</p>
            <div className="flex items-center justify-center gap-2 text-4xl font-black text-gray-800" dir="ltr">
              <span className="bg-brand-100 text-brand-700 rounded-2xl px-4 py-2">
                {toPersianDigits(question.a)}
              </span>
              <span className="text-accent-500">×</span>
              <span className="bg-brand-100 text-brand-700 rounded-2xl px-4 py-2">
                {toPersianDigits(question.b)}
              </span>
              <span className="text-gray-400">=</span>
              <span className="bg-gray-100 text-gray-400 rounded-2xl px-4 py-2">؟</span>
            </div>
          </div>
        </div>

        {/* Always-open number pad */}
        <div className="w-full max-w-md mt-4">
          <NumberPad
            maxValue={999}
            onSubmit={handleAnswer}
            disabled={padDisabled || feedback !== null}
            colorTheme={isP1Turn ? 'brand' : 'success'}
            resetTrigger={currentQ}
          />
          {feedback !== null && (
            <div className="mt-2 text-center">
              {feedback === 'wrong' && (
                <p className="font-bold text-success-600 text-lg animate-pop">
                  جواب درست: {toPersianDigits(question.answer)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Streak indicator */}
      {streak >= 3 && feedback === null && (
        <div className="fixed top-1/2 right-4 -translate-y-1/2 flex flex-col items-center animate-bounceIn pointer-events-none z-30">
          <div className="bg-gradient-to-br from-accent-400 to-accent-600 text-white rounded-2xl p-3 shadow-xl">
            <Zap size={24} className="animate-wiggle" />
            <p className="text-xs font-bold mt-1">{toPersianDigits(streak)}x</p>
          </div>
        </div>
      )}

      {/* Footer dots */}
      <div className="flex justify-center gap-1.5 pb-3 pt-2">
        {activeQuestions.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i < currentQ ? 'bg-success-400' : i === currentQ ? (isP1Turn ? 'bg-brand-500' : 'bg-success-500') + ' w-6' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function PlayerResult({ name, correct, total, color, isWinner }: { name: string; correct: number; total: number; color: 'brand' | 'success'; isWinner: boolean }) {
  const bg = color === 'brand' ? 'bg-brand-50 border-brand-200' : 'bg-success-50 border-success-200';
  const text = color === 'brand' ? 'text-brand-700' : 'text-success-700';
  return (
    <div className={`${bg} border-2 rounded-2xl p-4 relative ${isWinner ? 'ring-2 ring-warning-300' : ''}`}>
      {isWinner && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-warning-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          برنده
        </div>
      )}
      <p className={`font-bold ${text} text-sm mb-1 truncate`}>{name}</p>
      <p className={`text-3xl font-black ${text}`}>{toPersianDigits(correct)}</p>
      <p className="text-xs text-gray-400">از {toPersianDigits(total)}</p>
    </div>
  );
}
