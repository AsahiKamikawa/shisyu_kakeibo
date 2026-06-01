import { useState } from 'react';
import { TabBar, type TabId } from './components/TabBar';
import { MonthSwitcher } from './components/MonthSwitcher';
import { UpdatePrompt } from './components/UpdatePrompt';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { BudgetItems } from './pages/BudgetItems';
import { Charts } from './pages/Charts';
import { Settings } from './pages/Settings';

const titles: Record<TabId, string> = {
  home: 'ホーム',
  tx: '収支の記録',
  budget: '予算・項目',
  charts: 'グラフ',
  settings: '設定',
};

export default function App() {
  const [tab, setTab] = useState<TabId>('home');

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

      <main className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {tab === 'home' && <Dashboard />}
        {tab === 'tx' && <Transactions />}
        {tab === 'budget' && <BudgetItems />}
        {tab === 'charts' && <Charts />}
        {tab === 'settings' && <Settings />}
      </main>

      <TabBar active={tab} onChange={setTab} />
      <UpdatePrompt />
    </div>
  );
}
