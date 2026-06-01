import { useState } from 'react';
import type { PlanActual, Transaction } from '../types';
import { useBudgetStore } from '../store/budgetStore';
import { todayISO } from '../lib/format';

interface Props {
  monthId: string;
  initial?: Transaction;
  onClose: () => void;
}

export function TransactionForm({ monthId, initial, onClose }: Props) {
  const categories = useBudgetStore((s) => s.categories);
  const month = useBudgetStore((s) => s.months.find((m) => m.id === monthId));
  const addTransaction = useBudgetStore((s) => s.addTransaction);
  const updateTransaction = useBudgetStore((s) => s.updateTransaction);
  const deleteTransaction = useBudgetStore((s) => s.deleteTransaction);

  const editing = !!initial;
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [content, setContent] = useState(initial?.content ?? '');
  const [kind, setKind] = useState<'income' | 'expense'>(
    initial ? (initial.amount >= 0 ? 'income' : 'expense') : 'expense',
  );
  const [amount, setAmount] = useState<string>(
    initial ? String(Math.abs(initial.amount)) : '',
  );
  const [category, setCategory] = useState(
    initial?.category ?? categories.find((c) => c !== '開始残高') ?? categories[0] ?? '',
  );
  const [itemId, setItemId] = useState<string>(initial?.itemId ?? '');
  const [planActual, setPlanActual] = useState<PlanActual>(
    initial?.planActual ?? '実績',
  );
  const [memo, setMemo] = useState(initial?.memo ?? '');

  const matchingItems =
    month?.budgetItems.filter((i) => i.category === category) ?? [];

  const save = () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value === 0) return;
    const signed = kind === 'expense' ? -Math.abs(value) : Math.abs(value);
    const base = {
      date,
      content: content.trim() || (kind === 'income' ? '収入' : '支出'),
      category,
      itemId: itemId || null,
      amount: signed,
      planActual,
      memo: memo.trim() || undefined,
    };
    if (editing && initial) {
      updateTransaction(monthId, { ...base, id: initial.id });
    } else {
      addTransaction(monthId, base);
    }
    onClose();
  };

  const remove = () => {
    if (initial) deleteTransaction(monthId, initial.id);
    onClose();
  };

  const inputCls =
    'w-full rounded-xl bg-violet-50 px-3 py-2.5 text-slate-800 ring-1 ring-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-violet-950/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="safe-bottom w-full max-w-md rounded-t-3xl bg-white p-5 ring-1 ring-violet-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-300" />
        <h2 className="mb-4 text-lg font-bold text-slate-800">
          {editing ? '記録を編集' : '収支を記録'}
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setKind('expense')}
            className={`rounded-xl py-2.5 text-sm font-bold transition ${
              kind === 'expense'
                ? 'bg-rose-100 text-rose-600 ring-1 ring-rose-300'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            支出
          </button>
          <button
            type="button"
            onClick={() => setKind('income')}
            className={`rounded-xl py-2.5 text-sm font-bold transition ${
              kind === 'income'
                ? 'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-300'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            収入
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">金額</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-violet-400">
                ¥
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`${inputCls} pl-7 text-right text-lg font-bold tabular-nums`}
                autoFocus={!editing}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-500">日付</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">予定/実績</label>
              <select
                value={planActual}
                onChange={(e) => setPlanActual(e.target.value as PlanActual)}
                className={inputCls}
              >
                <option value="実績">実績</option>
                <option value="予定">予定</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">内容</label>
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="例: スーパー"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-500">カテゴリ</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setItemId('');
                }}
                className={inputCls}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">予算項目</label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className={inputCls}
                disabled={matchingItems.length === 0}
              >
                <option value="">（指定なし）</option>
                {matchingItems.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">メモ</label>
            <input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="任意"
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          {editing && (
            <button
              type="button"
              onClick={remove}
              className="rounded-xl bg-rose-100 px-4 py-3 font-semibold text-rose-500 ring-1 ring-rose-200"
            >
              削除
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-600"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={save}
            className="flex-1 rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 px-4 py-3 font-bold text-white shadow-md shadow-violet-300/40"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
