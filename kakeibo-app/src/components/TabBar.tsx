import type { ReactNode } from 'react';

export type TabId = 'home' | 'tx' | 'budget' | 'charts' | 'settings';

const icons: Record<TabId, ReactNode> = {
  home: (
    <path
      d="M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  tx: (
    <>
      <path
        d="M4 7h16M4 12h16M4 17h10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </>
  ),
  budget: (
    <>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M8 9h8M8 13h8M8 17h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  ),
  charts: (
    <>
      <path
        d="M4 20V10M10 20V4M16 20v-7M22 20H2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path
        d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  ),
};

const labels: Record<TabId, string> = {
  home: 'ホーム',
  tx: '入力',
  budget: '予算',
  charts: 'グラフ',
  settings: '設定',
};

const order: TabId[] = ['home', 'tx', 'budget', 'charts', 'settings'];

export function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-white/5 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
        {order.map((id) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-emerald-300' : 'text-slate-400'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                {icons[id]}
              </svg>
              {labels[id]}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
