import { useState } from 'react';
import type { PlanActual, Transaction } from '../types';
import { useBudgetStore } from '../store/budgetStore';
import { useBackupStore } from '../store/backupStore';
import { todayISO } from '../lib/format';
import { AmountTools } from './AmountTools';
import { FormSheet } from './FormSheet';

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
  const templates = useBudgetStore((s) => s.templates);
  const addTemplate = useBudgetStore((s) => s.addTemplate);

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

  const applyTemplate = (t: (typeof templates)[number]) => {
    setKind(t.kind);
    setContent(t.content);
    setCategory(t.category);
    setItemId(t.itemId ?? '');
    if (typeof t.amount === 'number') setAmount(String(Math.abs(t.amount)));
  };

  const saveAsTemplate = () => {
    const label = content.trim();
    if (!label) {
      alert('テンプレ名にする「内容」を入力してください。');
      return;
    }
    const value = Number(amount);
    addTemplate({
      label,
      content: label,
      category,
      itemId: itemId || null,
      kind,
      amount: Number.isFinite(value) && value !== 0 ? Math.abs(value) : undefined,
    });
  };

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
      onClose();
    } else {
      addTransaction(monthId, base);
      onClose();
      const backup = useBackupStore.getState();
      backup.markChanged();
      if (backup.askOnSave) backup.openPrompt();
    }
  };

  const remove = () => {
    if (initial) deleteTransaction(monthId, initial.id);
    onClose();
  };

  const inputCls =
    'w-full min-w-0 max-w-full rounded-xl bg-violet-50 px-3 py-2.5 text-slate-800 ring-1 ring-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400';

  const footer = (
    <>
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
    </>
  );

  return (
    <FormSheet
      title={editing ? '記録を編集' : '収支を記録'}
      onClose={onClose}
      footer={<div className="flex gap-2">{footer}</div>}
    >
      {!editing && templates.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t)}
              className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600 ring-1 ring-violet-200 active:bg-violet-100"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

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
        <div className="min-w-0">
          <label className="mb-1 block text-xs text-slate-500">金額</label>
          <div className="relative min-w-0">
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
          <AmountTools value={amount} onChange={setAmount} />
        </div>

        {/* 日付と予定/実績は縦並び（iOS の date UI が隣と重なるのを防ぐ） */}
        <div className="space-y-3">
          <div className="min-w-0">
            <label className="mb-1 block text-xs text-slate-500">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="min-w-0">
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

        <div className="min-w-0">
          <label className="mb-1 block text-xs text-slate-500">内容</label>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="例: スーパー"
            className={inputCls}
          />
        </div>

        <div className="space-y-3">
          <div className="min-w-0">
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
          <div className="min-w-0">
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

        <div className="min-w-0">
          <label className="mb-1 block text-xs text-slate-500">メモ</label>
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="任意"
            className={inputCls}
          />
        </div>

        {!editing && (
          <button
            type="button"
            onClick={saveAsTemplate}
            className="w-full rounded-xl bg-violet-50 py-2.5 text-sm font-semibold text-violet-600 ring-1 ring-violet-200 active:bg-violet-100"
          >
            ＋ この内容をテンプレに保存
          </button>
        )}
      </div>
    </FormSheet>
  );
}
