import { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, X, Flame, Timer, Zap } from 'lucide-react';
import type { Question } from '@/types';
import { toPersianDigits } from '@/utils/game';
import { playSound } from '@/utils/sound';
import { NumberPad } from '@/components/NumberPad';
import { Mascot } from '@/components/Mascot';

interface GameScreenProps {
  questions: Question[];
  levelId: number;
  levelTitle: string;
  onComplete: (correctCount: number, answers: boolean[]) => void;
  onExit: () => void;
}

export function GameScreen({ questions, levelId, levelTitle, onComplete, onExit }: GameScreenProps) {
  void levelId;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [floatText, setFloatText] = useState<{ text: string; color: string; id: number } | null>(null);
  const [wrongShake, setWrongShake] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'sad' | 'excited' | 'thinking'>('idle');
  const [padDisabled, setPadDisabled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerCount = useRef(0);

  const question = questions[currentIndex];

  // Timer
  useEffect(() => {
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
  }, [currentIndex, feedback]);

  const handleTimeout = useCallback(() => {
    if (feedback !== null) return;
    setFeedback('wrong');
    setAnswers((prev) => [...prev, false]);
    setLives((l) => l - 1);
    setStreak(0);
    setMascotMood('sad');
    setWrongShake(true);
    setPadDisabled(true);
    playSound('wrong');
    setTimeout(() => setWrongShake(false), 500);

    setTimeout(() => {
      goToNext(false);
    }, 1500);
  }, [feedback]);

  const goToNext = useCallback(
    (isCorrect: boolean) => {
      setFeedback(null);
      setSelectedOption(null);
      setPadDisabled(false);

      const newCount = answerCount.current + 1;
      answerCount.current = newCount;

      if (newCount >= questions.length) {
        const correctSoFar = answers.filter(Boolean).length + (isCorrect ? 1 : 0);
        onComplete(correctSoFar, [...answers, isCorrect]);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [answers, questions.length, onComplete]
  );

  const handleAnswer = useCallback(
    (value: number) => {
      if (feedback !== null || !question) return;
      if (timerRef.current) clearInterval(timerRef.current);

      const isCorrect = value === question.answer;
      setFeedback(isCorrect ? 'correct' : 'wrong');
      setSelectedOption(value);
      setAnswers((prev) => [...prev, isCorrect]);
      setPadDisabled(true);

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setMascotMood(newStreak >= 3 ? 'excited' : 'happy');
        playSound('correct');

        const messages = ['آفرین!', 'عالی!', 'حله!', 'بله!', 'درست!'];
        const colors = ['text-success-500', 'text-success-500', 'text-brand-500', 'text-success-500', 'text-success-500'];
        const idx = Math.floor(Math.random() * messages.length);
        setFloatText({ text: messages[idx], color: colors[idx], id: Date.now() });
      } else {
        setLives((l) => l - 1);
        setStreak(0);
        setMascotMood('sad');
        setWrongShake(true);
        playSound('wrong');
        setTimeout(() => setWrongShake(false), 500);
        setFloatText({ text: 'نه!', color: 'text-error-500', id: Date.now() });
      }

      setTimeout(() => {
        goToNext(isCorrect);
      }, 1400);
    },
    [feedback, question, streak, goToNext]
  );

  const handleOptionClick = (val: number) => {
    if (feedback !== null) return;
    setSelectedOption(val);
    handleAnswer(val);
  };

  if (!question) return null;

  const isMultipleChoice = !question.isReverse && question.options.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-brand-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={onExit}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition active:scale-90"
        >
          <X size={20} className="text-gray-600" />
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-400 font-medium">{toPersianDigits(levelTitle)}</p>
          <p className="font-bold text-gray-700">
            سؤال {toPersianDigits(currentIndex + 1)} از {toPersianDigits(questions.length)}
          </p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              size={22}
              className={i < lives ? 'text-error-500 fill-error-400' : 'text-gray-200'}
            />
          ))}
        </div>
      </div>

      {/* Stats bar: timer, streak, progress */}
      <div className="bg-white/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${timeLeft <= 5 ? 'bg-error-100 text-error-600' : 'bg-brand-100 text-brand-600'}`}>
            <Timer size={16} className={timeLeft <= 5 ? 'animate-pulse' : ''} />
            <span className="font-bold text-sm">{toPersianDigits(timeLeft)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent-100 text-accent-600">
          <Flame size={16} className={streak >= 3 ? 'animate-wiggle' : ''} />
          <span className="font-bold text-sm">{toPersianDigits(streak)}</span>
        </div>
        <div className="flex-1 mx-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-brand-400 to-brand-600 transition-all duration-300 rounded-full"
            style={{ width: `${(currentIndex / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question area - left aligned so answer is on the right */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        {/* Mascot */}
        <div className="mb-3">
          <Mascot mood={mascotMood} size={60} message={
            feedback === 'correct' ? undefined :
            feedback === 'wrong' ? undefined :
            mascotMood === 'thinking' ? 'فکر کن...' : undefined
          } />
        </div>

        {/* Question card - left aligned */}
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
            <p className="text-sm text-gray-400 mb-4 font-medium text-center">
              {question.isReverse ? 'عدد مورد نظر را پیدا کن' : 'حاصل ضرب را حساب کن'}
            </p>
            {/* Left-aligned equation so the answer is on the right */}
            <div className="flex items-center justify-center gap-2 text-4xl font-black text-gray-800" dir="ltr">
              {question.isReverse ? (
                <>
                  <span className="text-gray-400">؟</span>
                  <span className="text-accent-500">×</span>
                  <span className="bg-brand-100 text-brand-700 rounded-2xl px-4 py-2">
                    {toPersianDigits(question.b)}
                  </span>
                  <span className="text-gray-400">=</span>
                  <span className="bg-success-100 text-success-700 rounded-2xl px-4 py-2">
                    {toPersianDigits(question.a)}
                  </span>
                </>
              ) : (
                <>
                  <span className="bg-brand-100 text-brand-700 rounded-2xl px-4 py-2">
                    {toPersianDigits(question.a)}
                  </span>
                  <span className="text-accent-500">×</span>
                  <span className="bg-brand-100 text-brand-700 rounded-2xl px-4 py-2">
                    {toPersianDigits(question.b)}
                  </span>
                  <span className="text-gray-400">=</span>
                  <span className="bg-gray-100 text-gray-400 rounded-2xl px-4 py-2">؟</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Answer area */}
        <div className="w-full max-w-md mt-4">
          {isMultipleChoice ? (
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  disabled={feedback !== null}
                  className={`h-14 rounded-2xl text-2xl font-black border-2 transition-all duration-200 active:scale-95 ${
                    selectedOption === opt
                      ? feedback === 'correct'
                        ? 'bg-success-500 text-white border-success-600 scale-105 shadow-lg'
                        : 'bg-error-500 text-white border-error-600 scale-105 shadow-lg'
                      : opt === question.answer && feedback !== null
                      ? 'bg-success-100 text-success-700 border-success-300'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400 hover:bg-brand-50 shadow-sm'
                  }`}
                >
                  {toPersianDigits(opt)}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <NumberPad
                maxValue={999}
                onSubmit={handleAnswer}
                disabled={padDisabled || feedback !== null}
                colorTheme={question.isReverse ? 'accent' : 'brand'}
                resetTrigger={currentIndex}
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
        {questions.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i < currentIndex
                ? answers[i]
                  ? 'bg-success-400'
                  : 'bg-error-300'
                : i === currentIndex
                ? 'bg-brand-500 w-6'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
