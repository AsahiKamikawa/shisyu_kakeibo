interface Props {
  /** 絶対値の数値文字列 */
  value: string;
  onChange: (next: string) => void;
}

/**
 * 金額入力の補助ボタン群。クイック加算と丸め、クリアを提供する。
 */
export function AmountTools({ value, onChange }: Props) {
  const num = Math.abs(Math.trunc(Number(value) || 0));
  const add = (n: number) => onChange(String(num + n));
  const roundTo = (unit: number) => {
    if (num === 0) return;
    onChange(String(Math.round(num / unit) * unit));
  };

  const btn =
    'rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600 ring-1 ring-violet-200 active:bg-violet-100';

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <button type="button" onClick={() => add(1000)} className={btn}>
        +1千
      </button>
      <button type="button" onClick={() => add(5000)} className={btn}>
        +5千
      </button>
      <button type="button" onClick={() => add(10000)} className={btn}>
        +1万
      </button>
      <button type="button" onClick={() => roundTo(100)} className={btn}>
        百円丸め
      </button>
      <button type="button" onClick={() => roundTo(1000)} className={btn}>
        千円丸め
      </button>
      <button
        type="button"
        onClick={() => onChange('')}
        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 active:bg-slate-200"
      >
        クリア
      </button>
    </div>
  );
}
