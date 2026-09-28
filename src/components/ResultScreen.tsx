import { useEffect } from 'react';
import { Home, RotateCcw, ArrowRight, Trophy, Star, Zap, Target } from 'lucide-react';
import { toPersianDigits, calculateStars } from '@/utils/game';
import { playSound } from '@/utils/sound';
import { StarDisplay } from '@/components/StarDisplay';
import { Confetti } from '@/components/Confetti';
import { Mascot } from '@/components/Mascot';

interface ResultScreenProps {
  correctCount: number;
  totalQuestions: number;
  score: number;
  levelTitle: string;
  onRetry: () => void;
  onNext: () => void;
  onHome: () => void;
  hasNext: boolean;
}

export function ResultScreen({
  correctCount,
  totalQuestions,
  score,
  levelTitle,
  onRetry,
  onNext,
  onHome,
  hasNext,
}: ResultScreenProps) {
  const stars = calculateStars(correctCount, totalQuestions);
  const passed = stars > 0;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  useEffect(() => {
    if (passed) {
      playSound('win');
      if (stars >= 2) playSound('star');
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [passed, stars]);

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <Confetti active={passed && stars >= 2} count={80} />
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center animate-bounceIn my-auto">
        {/* Mascot */}
        <div className="flex justify-center mb-2">
          <Mascot mood={passed ? (stars === 3 ? 'excited' : 'happy') : 'sad'} size={70} />
        </div>

        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3 ${
            passed ? 'bg-gradient-to-br from-warning-300 to-warning-500' : 'bg-gradient-to-br from-gray-300 to-gray-400'
          } shadow-lg`}
        >
          <Trophy size={36} className="text-white" />
        </div>

        <h2 className="text-2xl font-black text-gray-800 mb-1">
          {passed ? (stars === 3 ? 'عالی بود!' : stars === 2 ? 'آفرین!' : 'خوب بود!') : 'دوباره تلاش کن!'}
        </h2>
        <p className="text-gray-400 text-sm mb-4">{toPersianDigits(levelTitle)}</p>

        <div className="flex justify-center mb-5">
          <StarDisplay stars={stars} size={48} animate />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatBox icon={<Target size={18} />} label="درست" value={correctCount} color="text-success-600 bg-success-50" />
          <StatBox icon={<Star size={18} />} label="اشتباه" value={totalQuestions - correctCount} color="text-error-600 bg-error-50" />
          <StatBox icon={<Zap size={18} />} label="امتیاز" value={score} color="text-brand-600 bg-brand-50" />
        </div>

        {/* Accuracy bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-500">دقت</span>
            <span className="text-xs font-bold text-gray-700">{toPersianDigits(accuracy)}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                accuracy >= 70 ? 'bg-gradient-to-l from-success-400 to-success-600' : 'bg-gradient-to-l from-accent-400 to-accent-600'
              }`}
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {hasNext && passed && (
            <button
              onClick={onNext}
              className="w-full h-14 bg-gradient-to-l from-brand-500 to-brand-600 text-white rounded-2xl font-bold text-lg hover:from-brand-600 hover:to-brand-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              مرحله بعد
              <ArrowRight size={22} className="rotate-180" />
            </button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRetry}
              className="py-3 bg-accent-50 text-accent-700 border-2 border-accent-200 rounded-2xl font-bold hover:bg-accent-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              دوباره
            </button>
            <button
              onClick={onHome}
              className="py-3 bg-gray-100 text-gray-700 border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Home size={20} />
              خانه
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-2xl py-3 flex flex-col items-center`}>
      <div className="flex items-center gap-1 mb-0.5">
        {icon}
        <p className="text-xl font-black">{toPersianDigits(value)}</p>
      </div>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}
