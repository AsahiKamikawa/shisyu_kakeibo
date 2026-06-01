import { useMemo, useState } from 'react';
import { useCurrentMonth } from '../store/budgetStore';
import type { Transaction } from '../types';
import { yen } from '../lib/format';
import { Card, SectionTitle } from '../components/ui';
import { TransactionForm } from '../components/TransactionForm';

export function Transactions() {
  const month = useCurrentMonth();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const sorted = useMemo(
    () =>
      [...month.transactions].sort((a, b) =>
        a.date === b.date ? 0 : a.date < b.date ? 1 : -1,
      ),
    [month.transactions],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>収支の記録（{sorted.length}件）</SectionTitle>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-violet-300/40 active:scale-95"
        >
          ＋ 追加
        </button>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          まだ記録がありません。
          <br />
          右上の「追加」から収支を入力できます。
        </Card>
      ) : (
        <Card className="divide-y divide-violet-100">
          {sorted.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setEditing(t)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-violet-50"
            >
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
