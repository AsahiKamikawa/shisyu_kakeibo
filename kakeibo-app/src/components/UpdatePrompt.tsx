import { useRegisterSW } from 'virtual:pwa-register/react';

// インストール済みアプリでも更新を検知できるよう、定期的に確認する
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1時間

export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // 定期チェック
      setInterval(() => {
        registration.update().catch(() => {});
      }, UPDATE_CHECK_INTERVAL);
      // アプリを再び開いた（フォアグラウンドに戻した）ときにもチェック
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-24">
      <div className="pointer-events-auto w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl shadow-violet-300/40 ring-1 ring-violet-200">
        {needRefresh ? (
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.7L4 16M4 20v-4h4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">新しいバージョンがあります</p>
              <p className="text-xs text-slate-500">最新の内容に更新できます。</p>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600"
            >
              後で
            </button>
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-violet-300/40"
            >
              更新
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="flex-1 text-sm font-medium text-slate-700">
              オフラインで使えるようになりました
            </p>
            <button
              type="button"
              onClick={close}
              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
