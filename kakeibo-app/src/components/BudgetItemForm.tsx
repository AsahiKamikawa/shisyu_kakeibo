import { useState } from 'react';
import type { BudgetItem } from '../types';
import { useBudgetStore } from '../store/budgetStore';
import { useKeyboardInset } from '../lib/useKeyboardInset';
import { AmountTools } from './AmountTools';

interface Props {
  monthId: string;
  initial?: BudgetItem;
  onClose: () => void;
}

export function BudgetItemForm({ monthId, initial, onClose }: Props) {
  const categories = useBudgetStore((s) => s.categories);
  const months = useBudgetStore((s) => s.months);
  const addBudgetItem = useBudgetStore((s) => s.addBudgetItem);
  const updateBudgetItem = useBudgetStore((s) => s.updateBudgetItem);
  const deleteBudgetItem = useBudgetStore((s) => s.deleteBudgetItem);
  const keyboardInset = useKeyboardInset();
  const sheetMaxHeight = `calc(100dvh - ${keyboardInset}px - ${
    keyboardInset > 0 ? 12 : 56
  }px)`;

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
  const [recurring, setRecurring] = useState(initial?.recurring ?? false);

  const prevMonth = months
    .filter((m) => m.id < monthId)
    .sort((a, b) => (a.id < b.id ? 1 : -1))[0];

  const fillFromLastMonth = () => {
    if (!prevMonth) return;
    const key = name.trim();
    if (!key) {
      alert('先に項目名を入力してください。');
      return;
    }
    const found = prevMonth.budgetItems.find((i) => i.name.trim() === key);
    if (!found) {
      alert(`「${prevMonth.label}」に同じ名前の項目が見つかりませんでした。`);
      return;
    }
    setAmount(String(Math.abs(found.plannedAmount)));
    setKind(found.plannedAmount >= 0 ? 'income' : 'expense');
    setCategory(found.category);
    setRecurring(found.recurring ?? false);
  };

  const save = () => {
    const value = Number(amount);
    if (!name.trim() || !Number.isFinite(value) || value === 0) return;
    const signed = kind === 'expense' ? -Math.abs(value) : Math.abs(value);
    const base = {
      name: name.trim(),
      category,
      plannedAmount: signed,
      memo: memo.trim() || undefined,
      recurring,
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
    'w-full rounded-xl bg-violet-50 px-3 py-2.5 text-slate-800 ring-1 ring-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400';

  return (
    <div
      className="anim-fade fixed inset-0 z-50 flex items-end justify-center bg-violet-950/30 backdrop-blur-sm"
      style={{ paddingBottom: keyboardInset }}
      onClick={onClose}
    >
      <div
        className="anim-sheet flex w-full max-w-md flex-col rounded-t-3xl bg-white ring-1 ring-violet-200"
        style={{ maxHeight: sheetMaxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-5 pt-4">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-300" />
          <h2 className="text-lg font-bold text-slate-800">
            {editing ? '予算項目を編集' : '予算項目を追加'}
          </h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-3 pt-3">
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
            <label className="mb-1 block text-xs text-slate-500">項目名</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 食費"
              className={inputCls}
              autoFocus={!editing}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">
              {kind === 'income' ? '見込み金額' : '月額予算'}
            </label>
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
              />
            </div>
            <AmountTools value={amount} onChange={setAmount} />
            {prevMonth && (
              <button
                type="button"
                onClick={fillFromLastMonth}
                className="mt-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-600 ring-1 ring-sky-200 active:bg-sky-100"
              >
                先月と同じ（{prevMonth.label}）
              </button>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">カテゴリ</label>
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
            <label className="mb-1 block text-xs text-slate-500">メモ</label>
            <input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="任意"
              className={inputCls}
            />
          </div>

          <label className="flex items-center justify-between gap-3 rounded-xl bg-violet-50/60 px-3 py-2.5">
            <span className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">毎月自動計上</span>
              <span className="text-xs text-slate-400">
                新しい月を作るとき「予定」として自動で記録します
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={recurring}
              onClick={() => setRecurring(!recurring)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                recurring ? 'bg-violet-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  recurring ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </label>
        </div>
        </div>

        <div className="flex shrink-0 gap-2 safe-bottom border-t border-violet-100 bg-white px-5 pb-3 pt-3">
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
