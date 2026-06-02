import { describe, it, expect } from 'vitest';
import { validateBudgetData } from './validate';
import type { BudgetData } from '../types';

const validData = (): BudgetData => ({
  categories: ['収入', '固定費'],
  currentMonthId: '2026-06',
  carryoverMode: 'projected',
  templates: [],
  categoryColors: { 固定費: '#abcdef' },
  months: [
    {
      id: '2026-06',
      label: '6月',
      startBalance: 1000,
      assumedSalary: 200000,
      defenseLine: 0,
      budgetItems: [
        { id: 'bi-1', name: '家賃', category: '固定費', plannedAmount: -80000 },
      ],
      transactions: [
        {
          id: 'tx-1',
          date: '2026-06-01',
          content: '家賃',
          category: '固定費',
          amount: -80000,
          planActual: '実績',
        },
      ],
    },
  ],
});

describe('validateBudgetData', () => {
  it('正しいデータを受理する', () => {
    const r = validateBudgetData(validData());
    expect(r.ok).toBe(true);
    expect(r.data?.months).toHaveLength(1);
    expect(r.data?.categoryColors).toEqual({ 固定費: '#abcdef' });
  });

  it('オブジェクトでなければ拒否する', () => {
    expect(validateBudgetData(null).ok).toBe(false);
    expect(validateBudgetData('x').ok).toBe(false);
    expect(validateBudgetData(123).ok).toBe(false);
  });

  it('months が空なら拒否する', () => {
    const d = validData();
    d.months = [];
    expect(validateBudgetData(d).ok).toBe(false);
  });

  it('月データが壊れていれば拒否する', () => {
    const d = validData() as unknown as { months: unknown[] };
    d.months = [{ id: '2026-06' }];
    expect(validateBudgetData(d).ok).toBe(false);
  });

  it('欠損した templates / categoryColors を補完する', () => {
    const d = validData() as Partial<BudgetData>;
    delete d.templates;
    delete d.categoryColors;
    const r = validateBudgetData(d);
    expect(r.ok).toBe(true);
    expect(r.data?.templates).toEqual([]);
    expect(r.data?.categoryColors).toEqual({});
  });

  it('currentMonthId が存在しない月を指していたら先頭月にフォールバックする', () => {
    const d = validData();
    d.currentMonthId = 'unknown';
    const r = validateBudgetData(d);
    expect(r.data?.currentMonthId).toBe('2026-06');
  });

  it('不正な carryoverMode は projected に正規化する', () => {
    const d = validData() as unknown as { carryoverMode: string };
    d.carryoverMode = 'weird';
    const r = validateBudgetData(d);
    expect(r.data?.carryoverMode).toBe('projected');
  });
});
