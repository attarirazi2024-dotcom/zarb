import { Star } from 'lucide-react';
import { toPersianDigits } from '@/utils/game';

interface StarDisplayProps {
  stars: number;
  size?: number;
  animate?: boolean;
}

export function StarDisplay({ stars, size = 32, animate = false }: StarDisplayProps) {
  return (
    <div className="flex gap-1 items-center justify-center">
      {[1, 2, 3].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= stars ? 'text-warning-400 fill-warning-400' : 'text-gray-300 fill-gray-200'}
          style={animate && n <= stars ? { animation: `bounceIn 0.5s ease-out ${n * 0.15}s both` } : undefined}
        />
      ))}
    </div>
  );
}

export function StarsBadge({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-1 bg-warning-50 px-3 py-1 rounded-full">
      <Star size={18} className="text-warning-500 fill-warning-400" />
      <span className="font-bold text-warning-700 text-sm">{toPersianDigits(stars)}</span>
    </div>
  );
}
