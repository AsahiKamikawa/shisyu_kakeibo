import type { ReactNode } from 'react';
import type { Judgment } from '../lib/calc';
import { yen } from '../lib/format';

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
}: {
  label: string;
  budget: number;
  spent: number;
  remaining: number;
  ratio: number;
}) {
  const pct = Math.min(100, Math.max(0, ratio * 100));
  const over = remaining < 0;
  const near = !over && ratio >= 0.8;
  const barColor = over
    ? 'bg-rose-400'
    : near
      ? 'bg-amber-400'
      : 'bg-gradient-to-r from-sky-400 to-violet-500';
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
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
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${pct}%` }}
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
