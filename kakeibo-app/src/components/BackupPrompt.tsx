import { useState } from 'react';
import { useBackupStore } from '../store/backupStore';
import { shareOrDownloadBackup } from '../lib/backup';

export function BackupPrompt() {
  const promptOpen = useBackupStore((s) => s.promptOpen);
  const pendingChanges = useBackupStore((s) => s.pendingChanges);
  const closePrompt = useBackupStore((s) => s.closePrompt);
  const markBackedUp = useBackupStore((s) => s.markBackedUp);
  const [busy, setBusy] = useState(false);

  if (!promptOpen) return null;

  const run = async (mode: 'overwrite' | 'new') => {
    if (busy) return;
    setBusy(true);
    const result = await shareOrDownloadBackup(mode);
    setBusy(false);
    if (result === 'shared' || result === 'downloaded') {
      markBackedUp();
    } else {
      // キャンセル・失敗時はカウントを維持したまま閉じる
      closePrompt();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-violet-950/30 backdrop-blur-sm"
      onClick={closePrompt}
    >
      <div
        className="safe-bottom w-full max-w-md rounded-t-3xl bg-white p-5 ring-1 ring-violet-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-300" />
        <h2 className="mb-1 text-lg font-bold text-slate-800">
          バックアップを更新しますか？
        </h2>
        <p className="mb-4 text-xs leading-relaxed text-slate-500">
          前回のバックアップから{pendingChanges}件の変更があります。書き出すと「ファイル」やiCloud
          Driveなどに保存できます。
        </p>

        <div className="space-y-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => run('overwrite')}
            className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 py-3 font-bold text-white shadow-md shadow-violet-300/40 disabled:opacity-50"
          >
            バックアップを更新する
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => run('new')}
            className="w-full rounded-xl bg-violet-50 py-3 font-semibold text-violet-700 ring-1 ring-violet-200 active:bg-violet-100 disabled:opacity-50"
          >
            別ファイルとして保存
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={closePrompt}
            className="w-full rounded-xl bg-slate-100 py-3 font-semibold text-slate-600 disabled:opacity-50"
          >
            今はしない
          </button>
        </div>
      </div>
    </div>
  );
}
