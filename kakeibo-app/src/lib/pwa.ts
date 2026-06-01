import { useSyncExternalStore } from 'react';
import { registerSW } from 'virtual:pwa-register';

let needRefresh = false;
let offlineReady = false;
let updateSW: ((reload?: boolean) => Promise<void>) | null = null;
let registration: ServiceWorkerRegistration | undefined;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

const CHECK_INTERVAL = 30 * 60 * 1000; // 30分ごと

/** アプリ起動時に1度だけ呼ぶ。Service Worker を登録し、更新検知を仕込む。 */
export function initPWA() {
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      needRefresh = true;
      emit();
    },
    onOfflineReady() {
      offlineReady = true;
      emit();
    },
    onRegisteredSW(_swScriptUrl, r) {
      registration = r;
      if (!r) return;
      // 起動直後にも一度チェック
      r.update().catch(() => {});
      setInterval(() => r.update().catch(() => {}), CHECK_INTERVAL);
    },
  });

  // アプリを再表示／フォーカスしたタイミングでも更新確認
  const recheck = () => {
    if (document.visibilityState === 'visible') {
      registration?.update().catch(() => {});
    }
  };
  document.addEventListener('visibilitychange', recheck);
  window.addEventListener('focus', recheck);
}

export function usePwaStatus() {
  const nr = useSyncExternalStore(
    subscribe,
    () => needRefresh,
    () => needRefresh,
  );
  const or = useSyncExternalStore(
    subscribe,
    () => offlineReady,
    () => offlineReady,
  );
  return { needRefresh: nr, offlineReady: or };
}

/** 待機中の新バージョンを有効化して再読み込み */
export async function applyUpdate() {
  if (updateSW) {
    await updateSW(true);
  } else {
    window.location.reload();
  }
}

export function dismissPrompt() {
  needRefresh = false;
  offlineReady = false;
  emit();
}

/** 手動で更新確認。新バージョンがあれば 'updating' を返す（バナーが出る）。 */
export async function checkForUpdate(): Promise<'updating' | 'latest'> {
  if (!registration) return 'latest';
  await registration.update().catch(() => {});
  await new Promise((res) => setTimeout(res, 1500));
  return needRefresh ? 'updating' : 'latest';
}
