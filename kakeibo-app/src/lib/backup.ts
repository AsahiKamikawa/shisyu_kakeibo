import type { BudgetData } from '../types';
import { useBudgetStore } from '../store/budgetStore';

/** 現在のストア状態からバックアップ用の BudgetData を組み立てる */
export function buildBackupData(): BudgetData {
  const s = useBudgetStore.getState();
  return {
    categories: s.categories,
    months: s.months,
    currentMonthId: s.currentMonthId,
    carryoverMode: s.carryoverMode,
    templates: s.templates ?? [],
    categoryColors: s.categoryColors ?? {},
  };
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** 書き出しファイル名（overwrite=固定名 / new=日時つき） */
function backupFilename(mode: 'overwrite' | 'new'): string {
  if (mode === 'overwrite') return 'kakeibo-backup.json';
  const d = new Date();
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(
    d.getHours(),
  )}${pad(d.getMinutes())}`;
  return `kakeibo-backup-${stamp}.json`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type BackupResult = 'shared' | 'downloaded' | 'cancelled' | 'error';

/**
 * バックアップJSONを iOS の共有シートに渡す。
 * 共有非対応端末（PC等）ではダウンロードにフォールバックする。
 */
export async function shareOrDownloadBackup(
  mode: 'overwrite' | 'new',
): Promise<BackupResult> {
  const data = buildBackupData();
  const json = JSON.stringify(data, null, 2);
  const filename = backupFilename(mode);

  // Web Share API（ファイル共有）が使える場合は共有シートへ
  try {
    const file = new File([json], filename, { type: 'application/json' });
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };
    if (
      typeof navigator.share === 'function' &&
      typeof nav.canShare === 'function' &&
      nav.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: '家計簿バックアップ',
        });
        return 'shared';
      } catch (err) {
        // ユーザーがキャンセルした場合
        if (err instanceof DOMException && err.name === 'AbortError') {
          return 'cancelled';
        }
        // 共有に失敗したらダウンロードにフォールバック
        downloadBlob(new Blob([json], { type: 'application/json' }), filename);
        return 'downloaded';
      }
    }
  } catch {
    // File 生成や canShare が使えない環境はフォールバックへ
  }

  downloadBlob(new Blob([json], { type: 'application/json' }), filename);
  return 'downloaded';
}
