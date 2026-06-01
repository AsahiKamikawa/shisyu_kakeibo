import { useRef, useState } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { useBackupStore } from '../store/backupStore';
import type { BudgetData } from '../types';
import { Card, CategoryDot, SectionTitle } from '../components/ui';
import { checkForUpdate } from '../lib/pwa';
import { shareOrDownloadBackup } from '../lib/backup';
import { CATEGORY_PALETTE, colorForCategory } from '../lib/colors';

export function Settings() {
  const categories = useBudgetStore((s) => s.categories);
  const carryoverMode = useBudgetStore((s) => s.carryoverMode);
  const setCarryoverMode = useBudgetStore((s) => s.setCarryoverMode);
  const addCategory = useBudgetStore((s) => s.addCategory);
  const renameCategory = useBudgetStore((s) => s.renameCategory);
  const deleteCategory = useBudgetStore((s) => s.deleteCategory);
  const importData = useBudgetStore((s) => s.importData);
  const resetData = useBudgetStore((s) => s.resetData);
  const templates = useBudgetStore((s) => s.templates);
  const deleteTemplate = useBudgetStore((s) => s.deleteTemplate);
  const categoryColors = useBudgetStore((s) => s.categoryColors);
  const setCategoryColor = useBudgetStore((s) => s.setCategoryColor);

  const lastBackupAt = useBackupStore((s) => s.lastBackupAt);
  const pendingChanges = useBackupStore((s) => s.pendingChanges);
  const askOnSave = useBackupStore((s) => s.askOnSave);
  const setAskOnSave = useBackupStore((s) => s.setAskOnSave);
  const markBackedUp = useBackupStore((s) => s.markBackedUp);

  const [newCat, setNewCat] = useState('');
  const [checking, setChecking] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [colorEditing, setColorEditing] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onCheckUpdate = async () => {
    setChecking(true);
    const result = await checkForUpdate();
    setChecking(false);
    if (result === 'latest') {
      alert('すでに最新の状態です。');
    }
    // 'updating' の場合は画面下に更新バナーが表示されます
  };

  const runBackup = async (mode: 'overwrite' | 'new') => {
    if (exporting) return;
    setExporting(true);
    const result = await shareOrDownloadBackup(mode);
    setExporting(false);
    if (result === 'shared' || result === 'downloaded') markBackedUp();
  };

  const lastBackupLabel = lastBackupAt
    ? new Date(lastBackupAt).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'まだありません';

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
    'w-full rounded-xl bg-violet-50 px-3 py-2.5 text-slate-800 ring-1 ring-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400';

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
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left active:bg-violet-50"
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ring-2 ${
                  carryoverMode === mode
                    ? 'ring-violet-500'
                    : 'ring-slate-300'
                }`}
              >
                {carryoverMode === mode && (
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                )}
              </span>
              <span className="flex flex-col">
                <span className="font-medium text-slate-700">{title}</span>
                <span className="text-xs text-slate-400">{desc}</span>
              </span>
            </button>
          ))}
        </Card>
      </div>

      {/* カテゴリ管理 */}
      <div className="space-y-3">
        <SectionTitle>カテゴリ管理</SectionTitle>
        <Card className="divide-y divide-violet-100">
          {categories.map((c) => (
            <div key={c} className="px-3 py-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setColorEditing((prev) => (prev === c ? null : c))
                  }
                  className="grid h-8 w-8 place-items-center rounded-lg active:bg-violet-100"
                  aria-label="色を変更"
                >
                  <CategoryDot
                    color={colorForCategory(c, categoryColors)}
                    className="h-4 w-4"
                  />
                </button>
                <input
                  defaultValue={c}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== c) renameCategory(c, v);
                  }}
                  className="flex-1 rounded-lg bg-transparent px-2 py-1.5 text-slate-700 focus:bg-violet-50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`カテゴリ「${c}」を削除しますか？`)) deleteCategory(c);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 active:bg-violet-100"
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
              {colorEditing === c && (
                <div className="anim-fade mt-1 flex flex-wrap gap-2 px-1 pb-2 pl-10">
                  {CATEGORY_PALETTE.map((color) => {
                    const active = colorForCategory(c, categoryColors) === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setCategoryColor(c, color);
                          setColorEditing(null);
                        }}
                        className={`h-7 w-7 rounded-full ring-2 transition ${
                          active ? 'ring-slate-400' : 'ring-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`色 ${color}`}
                      />
                    );
                  })}
                </div>
              )}
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
            className="shrink-0 rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 px-4 font-bold text-white shadow-md shadow-violet-300/40"
          >
            追加
          </button>
        </div>
      </div>

      {/* テンプレート */}
      <div className="space-y-3">
        <SectionTitle>入力テンプレート</SectionTitle>
        {templates.length === 0 ? (
          <Card className="p-5 text-center text-sm text-slate-500">
            テンプレートはまだありません。
            <br />
            収支の記録画面で「この内容をテンプレに保存」から登録できます。
          </Card>
        ) : (
          <Card className="divide-y divide-violet-100">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center gap-2 px-3 py-2.5">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-slate-700">{t.label}</span>
                  <span className="text-xs text-slate-400">
                    {t.kind === 'income' ? '収入' : '支出'}・{t.category}
                    {typeof t.amount === 'number' ? `・¥${t.amount.toLocaleString('ja-JP')}` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTemplate(t.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 active:bg-violet-100"
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
        )}
      </div>

      {/* データのバックアップ */}
      <div className="space-y-3">
        <SectionTitle>データのバックアップ</SectionTitle>
        <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">最終バックアップ</span>
            <span className="font-medium text-slate-700">{lastBackupLabel}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">未バックアップの変更</span>
            <span
              className={`font-bold tabular-nums ${
                pendingChanges > 0 ? 'text-amber-600' : 'text-slate-700'
              }`}
            >
              {pendingChanges}件
            </span>
          </div>
          <button
            type="button"
            disabled={exporting}
            onClick={() => runBackup('overwrite')}
            className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 py-3 font-bold text-white shadow-md shadow-violet-300/40 disabled:opacity-50"
          >
            今すぐ書き出す（更新）
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => runBackup('new')}
            className="w-full rounded-xl bg-violet-50 py-3 font-semibold text-violet-700 ring-1 ring-violet-200 active:bg-violet-100 disabled:opacity-50"
          >
            別ファイルとして書き出す
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl bg-violet-50 py-3 font-semibold text-violet-700 ring-1 ring-violet-200 active:bg-violet-100"
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
          <label className="flex items-center justify-between gap-3 rounded-xl bg-violet-50/60 px-3 py-2.5">
            <span className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">
                新規登録時に確認する
              </span>
              <span className="text-xs text-slate-400">
                記録を追加するたびにバックアップを促します
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={askOnSave}
              onClick={() => setAskOnSave(!askOnSave)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                askOnSave ? 'bg-violet-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  askOnSave ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </label>
        </Card>
        <p className="px-1 text-xs leading-relaxed text-slate-500">
          iPhoneでは書き出し時に共有メニューが開きます。「ファイル」やiCloud
          Driveに保存しておくと、機種変更や履歴削除に備えられます。データはこの端末内にのみ保存され、外部には送信されません。
        </p>
      </div>

      {/* データの初期化 */}
      <div className="space-y-3">
        <SectionTitle>データの初期化</SectionTitle>
        <Card className="p-3">
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
            className="w-full rounded-xl bg-rose-50 py-3 font-semibold text-rose-500 ring-1 ring-rose-200"
          >
            初期データにリセット
          </button>
        </Card>
      </div>

      {/* アプリの更新 */}
      <div className="space-y-3">
        <SectionTitle>アプリの更新</SectionTitle>
        <Card className="space-y-2 p-3">
          <button
            type="button"
            onClick={onCheckUpdate}
            disabled={checking}
            className="w-full rounded-xl bg-violet-50 py-3 font-semibold text-violet-700 ring-1 ring-violet-200 active:bg-violet-100 disabled:opacity-50"
          >
            {checking ? '確認中…' : '最新バージョンを確認'}
          </button>
        </Card>
        <p className="px-1 text-xs leading-relaxed text-slate-500">
          新しいバージョンがあると、画面下に「更新」バナーが表示されます。通常はアプリを開き直すと自動で確認されますが、すぐ確認したいときはこのボタンを使ってください。
        </p>
      </div>
    </div>
  );
}
