import type { ReactNode } from 'react';
import type { Judgment } from '../lib/calc';
import { yen } from '../lib/format';
import { useCountUp } from '../lib/useCountUp';

/** 金額を滑らかにカウントアップ表示する（reduced-motion時は即時） */
export function CountUp({ value }: { value: number }) {
  const v = useCountUp(value);
  return <>{yen(v)}</>;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center text-center ${
        compact ? 'gap-2 py-8' : 'gap-3 py-12'
      }`}
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-sky-100 to-violet-100 text-violet-400">
        {icon ?? <WalletIcon />}
      </span>
      <div className="space-y-1">
        <p className="text-sm font-bold text-slate-600">{title}</p>
        {description && (
          <p className="text-xs leading-relaxed text-slate-400">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-300/40 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function CategoryDot({
  color,
  className = '',
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}

export function WalletIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 0 1 1 1v1.5M3 7.5V17a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-2.5M3 7.5h15.5a2 2 0 0 1 2 2v2.5M16.5 11.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChartIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl bg-white/80 ring-1 ring-violet-200/60 shadow-lg shadow-violet-300/20 backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-1 text-sm font-bold tracking-wide text-violet-500">
      {children}
    </h2>
  );
}

export function JudgmentBadge({ value }: { value: Judgment }) {
  const ok = value === 'OK';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${
        ok
          ? 'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-300/70'
          : 'bg-rose-100 text-rose-500 ring-1 ring-rose-300/70'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`}
      />
      {ok ? '死守OK' : '危険'}
    </span>
  );
}

export function RemainingBar({
  label,
  budget,
  spent,
  remaining,
  ratio,
  color,
}: {
  label: string;
  budget: number;
  spent: number;
  remaining: number;
  ratio: number;
  color?: string;
}) {
  const pct = Math.min(100, Math.max(0, ratio * 100));
  const over = remaining < 0;
  const near = !over && ratio >= 0.8;
  // 超過/警告時は注意色を優先、通常時はカテゴリ色（指定なければグラデ）
  const useCategoryColor = !over && !near && color;
  const barClass = over
    ? 'bg-rose-400'
    : near
      ? 'bg-amber-400'
      : useCategoryColor
        ? ''
        : 'bg-gradient-to-r from-sky-400 to-violet-500';
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
          {color && <CategoryDot color={color} />}
          {label}
        </span>
        <span
          className={`text-sm font-semibold tabular-nums ${
            over ? 'text-rose-500' : 'text-slate-600'
          }`}
        >
          {over ? `${yen(-remaining)} 超過` : `残り ${yen(remaining)}`}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-violet-100">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{
            width: `${pct}%`,
            ...(useCategoryColor ? { backgroundColor: color } : {}),
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 tabular-nums">
        <span>使った {yen(spent)}</span>
        <span>予算 {yen(budget)}</span>
      </div>
    </div>
  );
}

export function Stat({
  label,
  value,
  accent = 'default',
}: {
  label: string;
  value: string;
  accent?: 'default' | 'good' | 'bad';
}) {
  const color =
    accent === 'good'
      ? 'text-emerald-600'
      : accent === 'bad'
        ? 'text-rose-500'
        : 'text-slate-700';
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-lg font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  );
}
