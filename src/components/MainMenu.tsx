import { Calculator, Repeat, Users, Trophy, Star, BookOpen, Award } from 'lucide-react';
import type { GameMode } from '@/types';
import { toPersianDigits } from '@/utils/game';
import { StarsBadge } from '@/components/StarDisplay';
import { Mascot } from '@/components/Mascot';
import { TOTAL_LEVELS } from '@/types';

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
  totalStars: number;
}

export function MainMenu({ onSelectMode, totalStars }: MainMenuProps) {
  const maxStars = TOTAL_LEVELS * 3;
  const progressPercent = Math.round((totalStars / maxStars) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-accent-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative shapes */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-brand-200/30 rounded-full blur-2xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-accent-200/30 rounded-full blur-2xl" />
      <div className="absolute top-1/3 left-20 w-24 h-24 bg-success-200/30 rounded-full blur-2xl" />

      <div className="relative z-10 text-center mb-6 animate-slideUp">
        <div className="flex justify-center mb-3">
          <Mascot mood="excited" size={80} message="به بازی ضرب خوش اومدی!" />
        </div>
        <h1 className="text-4xl font-black text-gray-800 mb-1">بازی ضرب</h1>
        <p className="text-lg text-gray-500">یادگیری جدول ضرب برای دبستان</p>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 w-full max-w-md mb-6 bg-white rounded-2xl p-4 shadow-md animate-slideUp" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-warning-500" />
            <span className="text-sm font-bold text-gray-600">پیشرفت کلی</span>
          </div>
          <StarsBadge stars={totalStars} />
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-warning-400 to-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-left" dir="ltr">
          {toPersianDigits(totalStars)} / {toPersianDigits(maxStars)} ★ ({toPersianDigits(progressPercent)}%)
        </p>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-3">
        <MenuButton
          icon={<Calculator size={30} />}
          title="بازی تک‌نفره"
          subtitle="۱۰۰ مرحله - از ضرب ۱ تا ۱۰"
          gradient="from-brand-500 to-brand-700"
          onClick={() => onSelectMode('single')}
          delay="0.15s"
        />
        <MenuButton
          icon={<Repeat size={30} />}
          title="ضرب معکوس"
          subtitle="جواب را پیدا کن، عدد را بنویس"
          gradient="from-accent-500 to-accent-700"
          onClick={() => onSelectMode('reverse')}
          delay="0.2s"
        />
        <MenuButton
          icon={<Users size={30} />}
          title="بازی دو نفره آفلاین"
          subtitle="با دوستت رقابت کن"
          gradient="from-success-500 to-success-700"
          onClick={() => onSelectMode('two-player')}
          delay="0.25s"
        />
      </div>

      <div className="relative z-10 mt-8 flex items-center gap-4 text-gray-400 text-sm animate-slideUp" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-1">
          <BookOpen size={16} />
          <span>۱۰۰ مرحله</span>
        </div>
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
        <div className="flex items-center gap-1">
          <Trophy size={16} />
          <span>۳۰۰ ستاره</span>
        </div>
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
        <div className="flex items-center gap-1">
          <Star size={16} className="text-warning-400" />
          <span>۳ حالت بازی</span>
        </div>
      </div>
    </div>
  );
}

function MenuButton({
  icon,
  title,
  subtitle,
  gradient,
  onClick,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  onClick: () => void;
  delay: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-gradient-to-l ${gradient} rounded-2xl p-4 text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-4 group animate-slideUp`}
      style={{ animationDelay: delay }}
    >
      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 group-hover:rotate-6 transition-all">
        {icon}
      </div>
      <div className="text-right flex-1">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-white/80">{toPersianDigits(subtitle)}</p>
      </div>
    </button>
  );
}
