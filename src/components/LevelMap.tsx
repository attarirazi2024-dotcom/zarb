import { ArrowRight, Lock, CheckCircle, Star, Play } from 'lucide-react';
import { toPersianDigits } from '@/utils/game';
import { QUESTIONS_PER_LEVEL, type Progress } from '@/types';

interface LevelMapProps {
  mode: 'single' | 'reverse';
  progress: Progress;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export function LevelMap({ mode, progress, onSelectLevel, onBack }: LevelMapProps) {
  const modeLabel = mode === 'reverse' ? 'ضرب معکوس' : 'بازی تک‌نفره';
  const modeColor = mode === 'reverse' ? 'from-accent-500 to-accent-600' : 'from-brand-500 to-brand-600';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className={`bg-gradient-to-l ${modeColor} text-white px-5 pt-6 pb-8 rounded-b-3xl shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition active:scale-90"
          >
            <ArrowRight size={22} />
          </button>
          <h1 className="text-xl font-bold">{modeLabel}</h1>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
            <Star size={16} className="text-warning-300 fill-warning-300" />
            <span className="font-bold text-sm">{toPersianDigits(progress.totalStars)}</span>
          </div>
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const groupStars = Array.from({ length: 10 }, (_, j) => {
              const lid = (n - 1) * 10 + j + 1;
              return progress.results[lid]?.stars ?? 0;
            }).reduce((a, b) => a + b, 0);
            return (
              <div key={n} className="flex flex-col items-center">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">
                  {toPersianDigits(n)}
                </div>
                <div className="text-[10px] mt-0.5">{toPersianDigits(groupStars)}★</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {Array.from({ length: 10 }, (_, rowIdx) => {
          const number = rowIdx + 1;
          return (
            <div key={number} className="mb-6 animate-slideUp" style={{ animationDelay: `${rowIdx * 0.05}s` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${modeColor} text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md`}>
                  {toPersianDigits(number)}
                </div>
                <h3 className="font-bold text-gray-700">ضرب‌های {toPersianDigits(number)}</h3>
                <div className="flex-1 h-0.5 bg-gray-200 rounded-full" />
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {Array.from({ length: QUESTIONS_PER_LEVEL }, (_, colIdx) => {
                  const levelId = number * 10 - 10 + colIdx + 1;
                  const result = progress.results[levelId];
                  const prevLevelId = levelId - 1;
                  const prevPassed = progress.results[prevLevelId];
                  const locked = levelId > 1 && !prevPassed;

                  return (
                    <button
                      key={levelId}
                      disabled={locked}
                      onClick={() => onSelectLevel(levelId)}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                        locked
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          : result
                          ? 'bg-gradient-to-br from-success-400 to-success-600 text-white shadow-md hover:scale-105 active:scale-95'
                          : 'bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-md hover:scale-105 active:scale-95 hover:shadow-xl'
                      }`}
                    >
                      {locked ? (
                        <Lock size={20} />
                      ) : result ? (
                        <>
                          <CheckCircle size={16} className="absolute top-1.5 right-1.5 text-white/70" />
                          <span className="font-black text-lg">{toPersianDigits(colIdx + 1)}</span>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                size={10}
                                className={s <= (result.stars ?? 0) ? 'text-warning-200 fill-warning-200' : 'text-white/30'}
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <Play size={18} className="mb-0.5" />
                          <span className="font-bold text-sm">{toPersianDigits(colIdx + 1)}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
