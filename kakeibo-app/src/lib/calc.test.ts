import { describe, it, expect } from 'vitest';
import type { BudgetItem, Month, Transaction } from '../types';
import {
  actualEndBalance,
  actualExpense,
  actualIncome,
  actualNet,
  buildRecurringTransactions,
  expenseCategorySummary,
  judge,
  plannedExpense,
  plannedIncome,
  plannedNet,
  projectedEndBalance,
  remainingToSpend,
} from './calc';

let seq = 0;
const item = (over: Partial<BudgetItem>): BudgetItem => ({
  id: `bi-${++seq}`,
  name: 'item',
  category: '変動費',
  plannedAmount: 0,
  ...over,
});
const tx = (over: Partial<Transaction>): Transaction => ({
  id: `tx-${++seq}`,
  date: '2026-06-10',
  content: 't',
  category: '変動費',
  amount: 0,
  planActual: '実績',
  ...over,
});
const month = (over: Partial<Month>): Month => ({
  id: '2026-06',
  label: '6月',
  startBalance: 0,
  assumedSalary: 0,
  defenseLine: 0,
  budgetItems: [],
  transactions: [],
  ...over,
});

describe('plannedNet / projectedEndBalance', () => {
  it('収入はプラス・支出はマイナスで純増減を計算する', () => {
    const m = month({
      startBalance: 100000,
      budgetItems: [
        item({ plannedAmount: 200000, category: '収入' }),
        item({ plannedAmount: -50000, category: '固定費' }),
        item({ plannedAmount: -30000, category: '変動費' }),
      ],
    });
    expect(plannedNet(m)).toBe(120000);
    expect(projectedEndBalance(m)).toBe(220000);
    expect(plannedIncome(m)).toBe(200000);
    expect(plannedExpense(m)).toBe(-80000);
  });
});

describe('actual 系は「実績」フラグのみ集計する', () => {
  const m = month({
    startBalance: 50000,
    transactions: [
      tx({ amount: 100000, category: '収入', planActual: '実績' }),
      tx({ amount: -20000, planActual: '実績' }),
      tx({ amount: -99999, planActual: '予定' }), // 予定は無視
    ],
  });
  it('actualNet / actualEndBalance', () => {
    expect(actualNet(m)).toBe(80000);
    expect(actualEndBalance(m)).toBe(130000);
  });
  it('actualIncome / actualExpense', () => {
    expect(actualIncome(m)).toBe(100000);
    expect(actualExpense(m)).toBe(-20000);
  });
});

describe('judge（死守判定）', () => {
  it('見込み残高が死守ライン以上なら OK', () => {
    expect(judge(month({ startBalance: 100, defenseLine: 100 }))).toBe('OK');
  });
  it('下回ると危険', () => {
    expect(
      judge(
        month({
          startBalance: 0,
          defenseLine: 1,
          budgetItems: [item({ plannedAmount: 0 })],
        }),
      ),
    ).toBe('危険');
  });
});

describe('expenseCategorySummary / remainingToSpend', () => {
  const m = month({
    budgetItems: [
      item({ plannedAmount: -30000, category: '食費' }),
      item({ plannedAmount: -10000, category: '日用品' }),
      item({ plannedAmount: 200000, category: '収入' }), // 収入は対象外
    ],
    transactions: [
      tx({ amount: -12000, category: '食費', planActual: '実績' }),
      tx({ amount: -5000, category: '日用品', planActual: '実績' }),
      tx({ amount: -3000, category: '食費', planActual: '予定' }), // 予定は対象外
    ],
  });
  it('カテゴリ別に予算・実績・残りを集計する', () => {
    const sumByCat = Object.fromEntries(
      expenseCategorySummary(m).map((c) => [c.category, c]),
    );
    expect(sumByCat['食費'].budget).toBe(30000);
    expect(sumByCat['食費'].spent).toBe(12000);
    expect(sumByCat['食費'].remaining).toBe(18000);
    expect(sumByCat['日用品'].remaining).toBe(5000);
    expect(sumByCat['収入']).toBeUndefined();
  });
  it('remainingToSpend は 支出予算 - 実績支出', () => {
    // 予算 40000 - 実績 17000 = 23000
    expect(remainingToSpend(m)).toBe(23000);
  });
});

describe('buildRecurringTransactions', () => {
  it('recurring かつ金額≠0 のみ、1日付の予定取引を生成する', () => {
    const items = [
      item({ id: 'a', name: '家賃', plannedAmount: -80000, recurring: true, category: '固定費' }),
      item({ id: 'b', name: '食費', plannedAmount: -30000, recurring: false }),
      item({ id: 'c', name: '空項目', plannedAmount: 0, recurring: true }),
    ];
    let n = 0;
    const result = buildRecurringTransactions(items, '2026-07', () => `gen-${++n}`);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      date: '2026-07-01',
      content: '家賃',
      category: '固定費',
      itemId: 'a',
      amount: -80000,
      planActual: '予定',
    });
  });
});
