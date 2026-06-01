import { useState } from 'react';
import { useCurrentMonth } from '../store/budgetStore';
import {
  actualEndBalance,
  actualExpense,
  actualIncome,
  expenseCategorySummary,
  judge,
  plannedExpense,
  plannedIncome,
  projectedEndBalance,
  remainingToSpend,
} from '../lib/calc';
import { signedYen, yen } from '../lib/format';
import { Card, JudgmentBadge, RemainingBar, SectionTitle, Stat } from '../components/ui';
import { TransactionForm } from '../components/TransactionForm';

export function Dashboard() {
  const month = useCurrentMonth();
  const [adding, setAdding] = useState(false);

  const projected = projectedEndBalance(month);
  const actual = actualEndBalance(month);
  const verdict = judge(month);
  const diff = projected - month.defenseLine;
  const cats = expenseCategorySummary(month);
  const canSpend = remainingToSpend(month);

  return (
    <div className="space-y-4">
      {/* メインカード：月末残高見込みと死守判定 */}
      <Card className="overflow-hidden">
        <div
          className={`p-5 ${
            verdict === 'OK'
              ? 'bg-gradient-to-br from-sky-200/70 via-violet-100/60 to-transparent'
              : 'bg-gradient-to-br from-rose-200/70 via-pink-100/50 to-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">月末残高見込み</span>
            <JudgmentBadge value={verdict} />
          </div>
          <div className="text-gradient mt-1 text-4xl font-extrabold tabular-nums">
            {yen(projected)}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-violet-200/70 pt-3 text-sm">
            <span className="text-slate-500">死守ライン {yen(month.defenseLine)}</span>
            <span
              className={`font-semibold tabular-nums ${
                diff >= 0 ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              {diff >= 0 ? `余裕 ${yen(diff)}` : `不足 ${yen(-diff)}`}
            </span>
          </div>
        </div>
      </Card>

      {/* 今月あと使える */}
      <Card className="p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-slate-500">今月あと使える（予算ベース）</div>
            <div
              className={`mt-1 text-3xl font-bold tabular-nums ${
                canSpend < 0 ? 'text-rose-500' : 'text-violet-600'
              }`}
            >
              {yen(canSpend)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-300/40 active:scale-95"
          >
            ＋ 記録する
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="実績残高" value={yen(actual)} />
          <Stat label="実績収入" value={yen(actualIncome(month))} accent="good" />
          <Stat label="実績支出" value={yen(actualExpense(month))} accent="bad" />
        </div>
      </Card>

      {/* カテゴリ別の残り */}
      <div className="space-y-3">
        <SectionTitle>カテゴリ別の残り（今月あと何にいくら）</SectionTitle>
        {cats.length === 0 ? (
          <Card className="p-5 text-center text-sm text-slate-500">
            支出予算がまだありません。「予算」タブで項目を追加してください。
          </Card>
        ) : (
          <Card className="space-y-4 p-5">
            {cats.map((c) => (
              <RemainingBar
                key={c.category}
                label={c.category}
                budget={c.budget}
                spent={c.spent}
                remaining={c.remaining}
                ratio={c.ratio}
              />
            ))}
          </Card>
        )}
      </div>

      {/* 見込みサマリー */}
      <div className="space-y-3">
        <SectionTitle>今月の見込み</SectionTitle>
        <Card className="grid grid-cols-2 gap-4 p-5">
          <Stat label="開始残高" value={yen(month.startBalance)} />
          <Stat label="給与想定" value={yen(month.assumedSalary)} />
          <Stat label="見込み収入" value={signedYen(plannedIncome(month))} accent="good" />
          <Stat label="見込み支出" value={signedYen(plannedExpense(month))} accent="bad" />
        </Card>
      </div>

      {adding && (
        <TransactionForm monthId={month.id} onClose={() => setAdding(false)} />
      )}
    </div>
  );
}
