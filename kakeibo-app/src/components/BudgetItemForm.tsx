import { useState } from 'react';
import type { BudgetItem } from '../types';
import { useBudgetStore } from '../store/budgetStore';

interface Props {
  monthId: string;
  initial?: BudgetItem;
  onClose: () => void;
}

export function BudgetItemForm({ monthId, initial, onClose }: Props) {
  const categories = useBudgetStore((s) => s.categories);
  const addBudgetItem = useBudgetStore((s) => s.addBudgetItem);
  const updateBudgetItem = useBudgetStore((s) => s.updateBudgetItem);
  const deleteBudgetItem = useBudgetStore((s) => s.deleteBudgetItem);

  const editing = !!initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [kind, setKind] = useState<'income' | 'expense'>(
    initial ? (initial.plannedAmount >= 0 ? 'income' : 'expense') : 'expense',
  );
  const [amount, setAmount] = useState<string>(
    initial ? String(Math.abs(initial.plannedAmount)) : '',
  );
  const [category, setCategory] = useState(
    initial?.category ?? categories.find((c) => c !== '開始残高') ?? categories[0] ?? '',
  );
  const [memo, setMemo] = useState(initial?.memo ?? '');

  const save = () => {
    const value = Number(amount);
    if (!name.trim() || !Number.isFinite(value) || value === 0) return;
    const signed = kind === 'expense' ? -Math.abs(value) : Math.abs(value);
    const base = {
      name: name.trim(),
      category,
      plannedAmount: signed,
      memo: memo.trim() || undefined,
    };
    if (editing && initial) {
      updateBudgetItem(monthId, { ...base, id: initial.id });
    } else {
      addBudgetItem(monthId, base);
    }
    onClose();
  };

  const remove = () => {
    if (initial) deleteBudgetItem(monthId, initial.id);
    onClose();
  };

  const inputCls =
    'w-full rounded-xl bg-slate-700/60 px-3 py-2.5 text-slate-100 ring-1 ring-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="safe-bottom w-full max-w-md rounded-t-3xl bg-slate-800 p-5 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-600" />
        <h2 className="mb-4 text-lg font-bold text-slate-100">
          {editing ? '予算項目を編集' : '予算項目を追加'}
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setKind('expense')}
            className={`rounded-xl py-2.5 text-sm font-bold transition ${
              kind === 'expense'
                ? 'bg-red-500/20 text-red-200 ring-1 ring-red-500/40'
                : 'bg-slate-700/40 text-slate-400'
            }`}
          >
            支出
          </button>
          <button
            type="button"
            onClick={() => setKind('income')}
            className={`rounded-xl py-2.5 text-sm font-bold transition ${
              kind === 'income'
                ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/40'
                : 'bg-slate-700/40 text-slate-400'
            }`}
          >
            収入
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-slate-400">項目名</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 食費"
              className={inputCls}
              autoFocus={!editing}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              {kind === 'income' ? '見込み金額' : '月額予算'}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ¥
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`${inputCls} pl-7 text-right text-lg font-bold tabular-nums`}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">カテゴリ</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <label className="mb-1 block text-xs text-slate-400">メモ</label>
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
              className="rounded-xl bg-red-500/15 px-4 py-3 font-semibold text-red-300 ring-1 ring-red-500/30"
            >
              削除
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-700/60 px-4 py-3 font-semibold text-slate-200"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={save}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-900"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
