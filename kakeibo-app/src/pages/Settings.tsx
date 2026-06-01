import { useRef, useState } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import type { BudgetData } from '../types';
import { Card, SectionTitle } from '../components/ui';

export function Settings() {
  const categories = useBudgetStore((s) => s.categories);
  const carryoverMode = useBudgetStore((s) => s.carryoverMode);
  const setCarryoverMode = useBudgetStore((s) => s.setCarryoverMode);
  const addCategory = useBudgetStore((s) => s.addCategory);
  const renameCategory = useBudgetStore((s) => s.renameCategory);
  const deleteCategory = useBudgetStore((s) => s.deleteCategory);
  const importData = useBudgetStore((s) => s.importData);
  const resetData = useBudgetStore((s) => s.resetData);

  const [newCat, setNewCat] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const state = useBudgetStore.getState();
    const data: BudgetData = {
      categories: state.categories,
      months: state.months,
      currentMonthId: state.currentMonthId,
      carryoverMode: state.carryoverMode,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kakeibo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as BudgetData;
      if (!Array.isArray(data.months) || !Array.isArray(data.categories)) {
        alert('ファイル形式が正しくありません。');
        return;
      }
      importData(data);
      alert('データを読み込みました。');
    } catch {
      alert('読み込みに失敗しました。');
    }
  };

  const inputCls =
    'w-full rounded-xl bg-slate-700/60 px-3 py-2.5 text-slate-100 ring-1 ring-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50';

  return (
    <div className="space-y-5">
      {/* 繰越設定 */}
      <div className="space-y-3">
        <SectionTitle>翌月への繰越</SectionTitle>
        <Card className="p-2">
          {(
            [
              ['projected', '見込みベース', '見込みの月末残高を翌月の開始残高にする'],
              ['actual', '実績ベース', '実績の月末残高を翌月の開始残高にする'],
            ] as const
          ).map(([mode, title, desc]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setCarryoverMode(mode)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left active:bg-white/5"
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ring-2 ${
                  carryoverMode === mode
                    ? 'ring-emerald-400'
                    : 'ring-slate-500'
                }`}
              >
                {carryoverMode === mode && (
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                )}
              </span>
              <span className="flex flex-col">
                <span className="font-medium text-slate-100">{title}</span>
                <span className="text-xs text-slate-500">{desc}</span>
              </span>
            </button>
          ))}
        </Card>
      </div>

      {/* カテゴリ管理 */}
      <div className="space-y-3">
        <SectionTitle>カテゴリ管理</SectionTitle>
        <Card className="divide-y divide-white/5">
          {categories.map((c) => (
            <div key={c} className="flex items-center gap-2 px-3 py-2">
              <input
                defaultValue={c}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== c) renameCategory(c, v);
                }}
                className="flex-1 rounded-lg bg-transparent px-2 py-1.5 text-slate-100 focus:bg-slate-700/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (confirm(`カテゴリ「${c}」を削除しますか？`)) deleteCategory(c);
                }}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 active:bg-white/10"
                aria-label="削除"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 7h12M9 7V5h6v2M10 11v6M14 11v6M7 7l1 13h8l1-13"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </Card>
        <div className="flex gap-2">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="新しいカテゴリ名"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => {
              const v = newCat.trim();
              if (v) {
                addCategory(v);
                setNewCat('');
              }
            }}
            className="shrink-0 rounded-xl bg-emerald-500 px-4 font-bold text-slate-900"
          >
            追加
          </button>
        </div>
      </div>

      {/* データ管理 */}
      <div className="space-y-3">
        <SectionTitle>データ管理</SectionTitle>
        <Card className="space-y-2 p-3">
          <button
            type="button"
            onClick={exportJson}
            className="w-full rounded-xl bg-slate-700/60 py-3 font-semibold text-slate-100 active:bg-white/10"
          >
            バックアップを書き出す（JSON）
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl bg-slate-700/60 py-3 font-semibold text-slate-100 active:bg-white/10"
          >
            バックアップを読み込む
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  '全データを初期状態（Excelの内容）に戻します。よろしいですか？',
                )
              ) {
                resetData();
              }
            }}
            className="w-full rounded-xl bg-red-500/10 py-3 font-semibold text-red-300/80 ring-1 ring-red-500/20"
          >
            初期データにリセット
          </button>
        </Card>
        <p className="px-1 text-xs leading-relaxed text-slate-500">
          データはこの端末のブラウザ内（ローカルストレージ）にのみ保存され、外部には送信されません。機種変更や履歴削除に備えて、ときどきバックアップを書き出してください。
        </p>
      </div>
    </div>
  );
}
