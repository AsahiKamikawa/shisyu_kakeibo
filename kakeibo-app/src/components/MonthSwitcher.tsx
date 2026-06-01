import { useBudgetStore } from '../store/budgetStore';
import { monthTitle } from '../lib/format';

export function MonthSwitcher() {
  const months = useBudgetStore((s) => s.months);
  const currentMonthId = useBudgetStore((s) => s.currentMonthId);
  const setCurrentMonth = useBudgetStore((s) => s.setCurrentMonth);
  const createMonth = useBudgetStore((s) => s.createMonth);

  const idx = months.findIndex((m) => m.id === currentMonthId);
  const go = (delta: number) => {
    const next = months[idx + delta];
    if (next) setCurrentMonth(next.id);
  };

  const isLast = idx === months.length - 1;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="前の月"
        disabled={idx <= 0}
        onClick={() => go(-1)}
        className="grid h-9 w-9 place-items-center rounded-full text-slate-300 disabled:opacity-30 active:bg-white/10"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 5l-7 7 7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <select
        value={currentMonthId}
        onChange={(e) => setCurrentMonth(e.target.value)}
        className="appearance-none rounded-lg bg-transparent px-2 py-1 text-center text-base font-bold text-slate-100 focus:outline-none"
      >
        {months.map((m) => (
          <option key={m.id} value={m.id} className="bg-slate-800">
            {monthTitle(m.id)}
          </option>
        ))}
      </select>

      {isLast ? (
        <button
          type="button"
          aria-label="翌月を追加"
          onClick={() => createMonth(currentMonthId)}
          className="grid h-9 w-9 place-items-center rounded-full text-emerald-300 active:bg-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          aria-label="次の月"
          onClick={() => go(1)}
          className="grid h-9 w-9 place-items-center rounded-full text-slate-300 active:bg-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
