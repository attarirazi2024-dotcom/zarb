import { useEffect, useState } from 'react';

type MascotMood = 'idle' | 'happy' | 'sad' | 'excited' | 'thinking';

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  message?: string;
}

export function Mascot({ mood = 'idle', size = 80, message }: MascotProps) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 2500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const bgGradient =
    mood === 'happy' || mood === 'excited'
      ? 'from-success-400 to-success-600'
      : mood === 'sad'
      ? 'from-error-300 to-error-500'
      : mood === 'thinking'
      ? 'from-accent-400 to-accent-600'
      : 'from-brand-400 to-brand-600';

  const mouth =
    mood === 'happy' || mood === 'excited'
      ? 'w-8 h-5 border-b-4 border-white rounded-b-full'
      : mood === 'sad'
      ? 'w-8 h-5 border-t-4 border-white rounded-t-full'
      : mood === 'thinking'
      ? 'w-6 h-1.5 bg-white rounded-full'
      : 'w-6 h-3 border-b-3 border-white rounded-b-full';

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative bg-gradient-to-br ${bgGradient} rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          mood === 'excited' ? 'animate-wiggle' : 'hover:scale-105'
        }`}
        style={{ width: size, height: size }}
      >
        {/* Eyes */}
        <div className="flex gap-3 items-center" style={{ marginTop: -size * 0.08 }}>
          <div
            className={`bg-white rounded-full transition-all ${blink ? 'h-1' : 'h-4'}`}
            style={{ width: size * 0.1 }}
          />
          <div
            className={`bg-white rounded-full transition-all ${blink ? 'h-1' : 'h-4'}`}
            style={{ width: size * 0.1 }}
          />
        </div>
        {/* Mouth */}
        <div
          className={`absolute ${mouth}`}
          style={{ bottom: size * 0.22 }}
        />
        {/* Cheeks */}
        {(mood === 'happy' || mood === 'excited') && (
          <>
            <div className="absolute bg-white/30 rounded-full" style={{ width: size * 0.12, height: size * 0.08, left: size * 0.15, bottom: size * 0.3 }} />
            <div className="absolute bg-white/30 rounded-full" style={{ width: size * 0.12, height: size * 0.08, right: size * 0.15, bottom: size * 0.3 }} />
          </>
        )}
      </div>
      {message && (
        <div className="mt-2 bg-white rounded-2xl px-4 py-2 shadow-md text-sm font-bold text-gray-700 relative animate-pop">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
          {message}
        </div>
      )}
    </div>
  );
}
