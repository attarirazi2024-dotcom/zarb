import { useEffect, useState } from 'react';
import { Delete, Check } from 'lucide-react';
import { toPersianDigits } from '@/utils/game';
import { playSound } from '@/utils/sound';

interface NumberPadProps {
  maxValue?: number;
  onSubmit: (value: number) => void;
  colorTheme?: 'brand' | 'success' | 'accent';
  disabled?: boolean;
  resetTrigger?: unknown;
}

export function NumberPad({
  maxValue = 999,
  onSubmit,
  colorTheme = 'brand',
  disabled = false,
  resetTrigger,
}: NumberPadProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue('');
  }, [resetTrigger]);

  const press = (d: string) => {
    if (disabled) return;
    if (value.length >= 3) return;
    const newVal = value + d;
    if (parseInt(newVal) > maxValue) return;
    setValue(newVal);
    playSound('click');
  };

  const backspace = () => {
    if (disabled) return;
    setValue((v) => v.slice(0, -1));
    playSound('click');
  };

  const submit = () => {
    if (disabled || value === '') return;
    onSubmit(parseInt(value));
    setValue('');
  };

  const themeClasses = {
    brand: {
      submit: 'from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700',
      display: 'border-brand-300 text-brand-700 bg-brand-50',
    },
    success: {
      submit: 'from-success-500 to-success-600 hover:from-success-600 hover:to-success-700',
      display: 'border-success-300 text-success-700 bg-success-50',
    },
    accent: {
      submit: 'from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700',
      display: 'border-accent-300 text-accent-700 bg-accent-50',
    },
  };

  const theme = themeClasses[colorTheme];
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full" dir="ltr">
      {/* Display */}
      <div className={`h-14 ${theme.display} rounded-2xl border-2 flex items-center justify-center text-3xl font-black shadow-inner mb-3 transition-all`}>
        {value ? (
          <span className="animate-pop">{toPersianDigits(value)}</span>
        ) : (
          <span className="text-gray-300 text-base font-medium">جواب را بنویس</span>
        )}
      </div>

      {/* Number grid 0-9 */}
      <div className="grid grid-cols-3 gap-2" dir="ltr">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            disabled={disabled}
            className="h-14 bg-gradient-to-b from-white to-gray-50 border-2 border-gray-200 rounded-2xl text-2xl font-black text-gray-700 hover:border-brand-400 hover:from-brand-50 hover:to-brand-100 active:scale-90 transition-all shadow-sm disabled:opacity-40"
          >
            {toPersianDigits(k)}
          </button>
        ))}
        {/* Submit button (replaces clear) */}
        <button
          onClick={submit}
          disabled={disabled || value === ''}
          className={`h-14 bg-gradient-to-l ${theme.submit} text-white border-2 border-transparent rounded-2xl text-sm font-bold active:scale-90 transition-all shadow-md flex items-center justify-center gap-1 disabled:opacity-40 disabled:active:scale-100`}
        >
          <Check size={20} />
          تأیید
        </button>
        {/* Zero */}
        <button
          onClick={() => press('0')}
          disabled={disabled}
          className="h-14 bg-gradient-to-b from-white to-gray-50 border-2 border-gray-200 rounded-2xl text-2xl font-black text-gray-700 hover:border-brand-400 hover:from-brand-50 hover:to-brand-100 active:scale-90 transition-all shadow-sm disabled:opacity-40"
        >
          {toPersianDigits(0)}
        </button>
        {/* Backspace */}
        <button
          onClick={backspace}
          disabled={disabled}
          className="h-14 bg-error-50 border-2 border-error-200 rounded-2xl flex items-center justify-center text-error-600 hover:bg-error-100 active:scale-90 transition-all disabled:opacity-40"
        >
          <Delete size={22} />
        </button>
      </div>
    </div>
  );
}
