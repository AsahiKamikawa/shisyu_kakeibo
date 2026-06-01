import { useMemo, useState } from 'react';
import { useBudgetStore, useCurrentMonth } from '../store/budgetStore';
import type { PlanActual, Transaction } from '../types';
import { yen } from '../lib/format';
import { colorForCategory } from '../lib/colors';
import { Card, CategoryDot, EmptyState, SectionTitle } from '../components/ui';
import { TransactionForm } from '../components/TransactionForm';

type KindFilter = 'all' | 'expense' | 'income';
type StateFilter = 'all' | PlanActual;
type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const chip = (active: boolean): string =>
  `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
    active
      ? 'bg-gradient-to-r from-sky-400 to-violet-500 text-white shadow-sm shadow-violet-300/40'
      : 'bg-violet-50 text-violet-600 ring-1 ring-violet-200'
  }`;

export function Transactions() {
  const month = useCurrentMonth();
  const categoryColors = useBudgetStore((s) => s.categoryColors);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');
  const [sort, setSort] = useState<SortKey>('date-desc');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = month.transactions.filter((t) => {
      if (kind === 'expense' && t.amount > 0) return false;
      if (kind === 'income' && t.amount < 0) return false;
      if (stateFilter !== 'all' && t.planActual !== stateFilter) return false;
      if (q) {
        const hay = `${t.content} ${t.category} ${t.memo ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const sorted = [...list];
    switch (sort) {
      case 'date-asc':
        sorted.sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? -1 : 1));
        break;
      case 'amount-desc':
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      default:
        sorted.sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
    }
    return sorted;
  }, [month.transactions, query, kind, stateFilter, sort]);

  const total = month.transactions.length;

  const selectCls =
    'rounded-xl bg-violet-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>
          収支の記録（{filtered.length}
          {filtered.length !== total ? ` / ${total}` : ''}件）
        </SectionTitle>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-violet-300/40 active:scale-95"
        >
          ＋ 追加
        </button>
      </div>

      {total > 0 && (
        <div className="space-y-2.5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="内容・カテゴリ・メモで検索"
            className="w-full rounded-xl bg-violet-50 px-3 py-2.5 text-sm text-slate-800 ring-1 ring-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={() => setKind('all')} className={chip(kind === 'all')}>
              すべて
            </button>
            <button
              type="button"
              onClick={() => setKind('expense')}
              className={chip(kind === 'expense')}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => setKind('income')}
              className={chip(kind === 'income')}
            >
              収入
            </button>
            <span className="mx-1 h-4 w-px bg-violet-200" />
            <button
              type="button"
              onClick={() => setStateFilter('all')}
              className={chip(stateFilter === 'all')}
            >
              全状態
            </button>
            <button
              type="button"
              onClick={() => setStateFilter('実績')}
              className={chip(stateFilter === '実績')}
            >
              実績
            </button>
            <button
              type="button"
              onClick={() => setStateFilter('予定')}
              className={chip(stateFilter === '予定')}
            >
              予定
            </button>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={`${selectCls} w-full`}
          >
            <option value="date-desc">日付（新しい順）</option>
            <option value="date-asc">日付（古い順）</option>
            <option value="amount-desc">金額（大きい順）</option>
            <option value="amount-asc">金額（小さい順）</option>
          </select>
        </div>
      )}

      {total === 0 ? (
        <Card>
          <EmptyState
            title="まだ記録がありません"
            description="収入や支出を記録して、今月あといくら使えるかを管理しましょう。"
            actionLabel="＋ 最初の記録を追加"
            onAction={() => setAdding(true)}
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          条件に合う記録がありません。
        </Card>
      ) : (
        <Card className="anim-pop divide-y divide-violet-100">
          {filtered.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setEditing(t)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-violet-50"
            >
              <CategoryDot color={colorForCategory(t.category, categoryColors)} />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-slate-700">
                    {t.content}
                  </span>
                  {t.planActual === '予定' && (
                    <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                      予定
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {t.date.slice(5).replace('-', '/')}・{t.category}
                  {t.memo ? `・${t.memo}` : ''}
                </span>
              </div>
              <span
                className={`shrink-0 font-bold tabular-nums ${
                  t.amount >= 0 ? 'text-emerald-600' : 'text-slate-700'
                }`}
              >
                {t.amount >= 0 ? `+${yen(t.amount)}` : yen(t.amount)}
              </span>
            </button>
          ))}
        </Card>
      )}

      {adding && (
        <TransactionForm monthId={month.id} onClose={() => setAdding(false)} />
      )}
      {editing && (
        <TransactionForm
          monthId={month.id}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
