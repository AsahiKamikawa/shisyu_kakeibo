import { useState } from 'react';
import { useBudgetStore, useCurrentMonth } from '../store/budgetStore';
import type { BudgetItem } from '../types';
import { signedYen, yen } from '../lib/format';
import { plannedExpense, plannedIncome, plannedNet, projectedEndBalance } from '../lib/calc';
import { Card, SectionTitle, Stat } from '../components/ui';
import { BudgetItemForm } from '../components/BudgetItemForm';

export function BudgetItems() {
  const month = useCurrentMonth();
  const months = useBudgetStore((s) => s.months);
  const updateMonthMeta = useBudgetStore((s) => s.updateMonthMeta);
  const copyBudgetItemsFrom = useBudgetStore((s) => s.copyBudgetItemsFrom);
  const deleteMonth = useBudgetStore((s) => s.deleteMonth);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<BudgetItem | null>(null);

  const prevMonths = months.filter((m) => m.id < month.id);

  const metaInput =
    'w-full rounded-lg bg-slate-700/60 px-3 py-2 text-right text-slate-100 tabular-nums ring-1 ring-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50';

  return (
    <div className="space-y-4">
      {/* 月の設定 */}
      <div className="space-y-3">
        <SectionTitle>月の設定</SectionTitle>
        <Card className="space-y-3 p-5">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-300">開始残高</span>
            <input
              type="number"
              value={month.startBalance}
              onChange={(e) =>
                updateMonthMeta(month.id, { startBalance: Number(e.target.value) || 0 })
              }
              className={`${metaInput} max-w-[55%]`}
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-300">死守ライン</span>
            <input
              type="number"
              value={month.defenseLine}
              onChange={(e) =>
                updateMonthMeta(month.id, { defenseLine: Number(e.target.value) || 0 })
              }
              className={`${metaInput} max-w-[55%]`}
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-300">給与想定</span>
            <input
              type="number"
              value={month.assumedSalary}
              onChange={(e) =>
                updateMonthMeta(month.id, { assumedSalary: Number(e.target.value) || 0 })
              }
              className={`${metaInput} max-w-[55%]`}
            />
          </label>
        </Card>
        <Card className="grid grid-cols-2 gap-4 p-5">
          <Stat label="見込み収入" value={signedYen(plannedIncome(month))} accent="good" />
          <Stat label="見込み支出" value={signedYen(plannedExpense(month))} accent="bad" />
          <Stat label="見込み純増減" value={signedYen(plannedNet(month))} />
          <Stat label="月末残高見込み" value={yen(projectedEndBalance(month))} />
        </Card>
      </div>

      {/* 予算項目 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionTitle>予算項目（{month.budgetItems.length}件）</SectionTitle>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-900 active:scale-95"
          >
            ＋ 追加
          </button>
        </div>

        {month.budgetItems.length === 0 ? (
          <Card className="p-6 text-center text-sm text-slate-400">
            項目がありません。
            {prevMonths.length > 0 && '前月からコピーするか、'}
            「追加」で作成してください。
          </Card>
        ) : (
          <Card className="divide-y divide-white/5">
            {month.budgetItems.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setEditing(i)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-white/5"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-slate-100">{i.name}</span>
                  <span className="text-xs text-slate-500">{i.category}</span>
                </div>
                <span
                  className={`shrink-0 font-bold tabular-nums ${
                    i.plannedAmount >= 0 ? 'text-emerald-300' : 'text-slate-100'
                  }`}
                >
                  {signedYen(i.plannedAmount)}
                </span>
              </button>
            ))}
          </Card>
        )}

        {prevMonths.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prevMonths.slice(-3).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  if (
                    month.budgetItems.length === 0 ||
                    confirm(`${m.label}の予算項目で上書きしますか？`)
                  ) {
                    copyBudgetItemsFrom(month.id, m.id);
                  }
                }}
                className="rounded-xl bg-slate-700/60 px-3 py-2 text-xs font-medium text-slate-200 ring-1 ring-white/5 active:bg-white/10"
              >
                {m.label}の項目をコピー
              </button>
            ))}
          </div>
        )}
      </div>

      {months.length > 1 && (
        <button
          type="button"
          onClick={() => {
            if (confirm(`${month.label}を削除しますか？この操作は元に戻せません。`)) {
              deleteMonth(month.id);
            }
          }}
          className="w-full rounded-xl bg-red-500/10 py-3 text-sm font-semibold text-red-300/80 ring-1 ring-red-500/20"
        >
          この月を削除
        </button>
      )}

      {adding && <BudgetItemForm monthId={month.id} onClose={() => setAdding(false)} />}
      {editing && (
        <BudgetItemForm
          monthId={month.id}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
