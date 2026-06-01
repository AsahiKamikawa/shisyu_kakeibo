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
      className={`rounded-2xl bg-slate-800/70 ring-1 ring-white/5 shadow-lg shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-1 text-sm font-semibold tracking-wide text-slate-400">
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
          ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
          : 'bg-red-500/15 text-red-300 ring-1 ring-red-500/30'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`}
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
    ? 'bg-red-500'
    : near
      ? 'bg-amber-400'
      : 'bg-emerald-400';
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <span
          className={`text-sm font-semibold tabular-nums ${
            over ? 'text-red-300' : 'text-slate-300'
          }`}
        >
          {over ? `${yen(-remaining)} 超過` : `残り ${yen(remaining)}`}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700/60">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 tabular-nums">
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
      ? 'text-emerald-300'
      : accent === 'bad'
        ? 'text-red-300'
        : 'text-slate-100';
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-lg font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  );
}
