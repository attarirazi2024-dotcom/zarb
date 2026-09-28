import { useState } from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { toPersianDigits } from '@/utils/game';

interface TwoPlayerSetupProps {
  onStart: (p1Name: string, p2Name: string, questionCount: number) => void;
  onBack: () => void;
}

export function TwoPlayerSetup({ onStart, onBack }: TwoPlayerSetupProps) {
  const [p1, setP1] = useState('بازیکن ۱');
  const [p2, setP2] = useState('بازیکن ۲');
  const [count, setCount] = useState(10);

  return (
    <div className="min-h-screen bg-gradient-to-b from-success-50 to-white flex flex-col">
      <div className="bg-gradient-to-l from-success-500 to-success-700 text-white px-5 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition active:scale-90"
          >
            <ArrowRight size={22} />
          </button>
          <h1 className="text-xl font-bold">بازی دو نفره</h1>
          <div className="w-10" />
        </div>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-2">
            <Users size={32} />
          </div>
          <p className="text-white/80 text-sm">نام بازیکنان را وارد کنید</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">نام بازیکن اول</label>
            <input
              type="text"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              maxLength={15}
              className="w-full h-14 bg-white border-2 border-brand-200 rounded-2xl px-4 text-lg font-medium text-gray-700 focus:border-brand-500 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">نام بازیکن دوم</label>
            <input
              type="text"
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              maxLength={15}
              className="w-full h-14 bg-white border-2 border-success-200 rounded-2xl px-4 text-lg font-medium text-gray-700 focus:border-success-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">تعداد سؤالات</label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`h-14 rounded-2xl font-bold text-lg border-2 transition-all active:scale-95 ${
                    count === n
                      ? 'bg-brand-500 text-white border-brand-600 shadow-lg'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                  }`}
                >
                  {toPersianDigits(n)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onStart(p1.trim() || 'بازیکن ۱', p2.trim() || 'بازیکن ۲', count)}
          className="w-full h-14 mt-8 bg-gradient-to-l from-success-500 to-success-600 text-white rounded-2xl font-bold text-xl hover:from-success-600 hover:to-success-700 active:scale-95 transition-all shadow-lg"
        >
          شروع بازی
        </button>
      </div>
    </div>
  );
}
