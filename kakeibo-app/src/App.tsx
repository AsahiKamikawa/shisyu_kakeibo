import { useEffect, useState } from 'react';
import { TabBar, type TabId } from './components/TabBar';
import { MonthSwitcher } from './components/MonthSwitcher';
import { UpdatePrompt } from './components/UpdatePrompt';
import { BackupPrompt } from './components/BackupPrompt';
import { useBackupStore } from './store/backupStore';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { BudgetItems } from './pages/BudgetItems';
import { Charts } from './pages/Charts';
import { Settings } from './pages/Settings';

const BACKUP_REMINDER_DAYS = 7;

const titles: Record<TabId, string> = {
  home: 'ホーム',
  tx: '収支の記録',
  budget: '予算・項目',
  charts: 'グラフ',
  settings: '設定',
};

export default function App() {
  const [tab, setTab] = useState<TabId>('home');
  const [showReminder, setShowReminder] = useState(false);
  const openPrompt = useBackupStore((s) => s.openPrompt);

  useEffect(() => {
    const { pendingChanges, lastBackupAt } = useBackupStore.getState();
    const stale =
      lastBackupAt === null
        ? pendingChanges > 0
        : Date.now() - new Date(lastBackupAt).getTime() >
          BACKUP_REMINDER_DAYS * 24 * 60 * 60 * 1000;
    if (pendingChanges > 0 && stale) setShowReminder(true);
  }, []);

  return (
    <div className="app-shell mx-auto flex max-w-md flex-col overflow-hidden">
      <header className="safe-top z-10 shrink-0 border-b border-violet-200/60 bg-white/70 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-gradient text-[11px] font-bold tracking-wide">
              絶対死守 家計簿
            </span>
            <span className="text-base font-bold text-slate-700">{titles[tab]}</span>
          </div>
          <MonthSwitcher />
        </div>
      </header>

      {showReminder && (
        <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 text-xs text-amber-700">
              未バックアップの変更があります。書き出しておくと安心です。
            </p>
            <button
              type="button"
              onClick={() => {
                setShowReminder(false);
                openPrompt();
              }}
              className="shrink-0 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-white"
            >
              書き出す
            </button>
            <button
              type="button"
              onClick={() => setShowReminder(false)}
              className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-semibold text-amber-600"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4">
        {tab === 'home' && <Dashboard />}
        {tab === 'tx' && <Transactions />}
        {tab === 'budget' && <BudgetItems />}
        {tab === 'charts' && <Charts />}
        {tab === 'settings' && <Settings />}
      </main>

      <TabBar active={tab} onChange={setTab} />
      <UpdatePrompt />
      <BackupPrompt />
    </div>
  );
}
