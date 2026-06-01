import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BackupState {
  /** 最後にバックアップを書き出した日時（ISO 文字列） */
  lastBackupAt: string | null;
  /** 前回バックアップ以降の未保存の変更件数 */
  pendingChanges: number;
  /** 新規登録時にバックアップ確認ダイアログを出すか */
  askOnSave: boolean;
  /** 確認シートを開いているか（永続化しない一時状態） */
  promptOpen: boolean;

  markChanged: () => void;
  markBackedUp: () => void;
  openPrompt: () => void;
  closePrompt: () => void;
  setAskOnSave: (value: boolean) => void;
}

export const useBackupStore = create<BackupState>()(
  persist(
    (set) => ({
      lastBackupAt: null,
      pendingChanges: 0,
      askOnSave: true,
      promptOpen: false,

      markChanged: () =>
        set((s) => ({ pendingChanges: s.pendingChanges + 1 })),
      markBackedUp: () =>
        set({
          lastBackupAt: new Date().toISOString(),
          pendingChanges: 0,
          promptOpen: false,
        }),
      openPrompt: () => set({ promptOpen: true }),
      closePrompt: () => set({ promptOpen: false }),
      setAskOnSave: (value) => set({ askOnSave: value }),
    }),
    {
      name: 'kakeibo-backup-meta',
      version: 1,
      // promptOpen は一時状態なので永続化しない
      partialize: (s) => ({
        lastBackupAt: s.lastBackupAt,
        pendingChanges: s.pendingChanges,
        askOnSave: s.askOnSave,
      }),
    },
  ),
);
