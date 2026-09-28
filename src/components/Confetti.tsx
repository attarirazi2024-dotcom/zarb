import { useEffect, useState } from 'react';

interface ConfettiProps {
  active: boolean;
  count?: number;
}

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Confetti({ active, count = 50 }: ConfettiProps) {
  const [pieces, setPieces] = useState<
    { id: number; left: number; delay: number; color: string; size: number; duration: number }[]
  >([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    const arr = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 8 + Math.random() * 8,
      duration: 2 + Math.random() * 2,
    }));
    setPieces(arr);
  }, [active, count]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-confettiFall"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
