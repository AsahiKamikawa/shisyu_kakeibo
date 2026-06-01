import type { Month } from '../types';

export type Judgment = 'OK' | '危険';

export const sum = (ns: number[]): number => ns.reduce((a, b) => a + b, 0);

/** 見込み（予算）の純増減：収入 - 支出 */
export const plannedNet = (m: Month): number =>
  sum(m.budgetItems.map((i) => i.plannedAmount));

/** 実績の純増減（「実績」フラグの行のみ集計） */
export const actualNet = (m: Month): number =>
  sum(m.transactions.filter((t) => t.planActual === '実績').map((t) => t.amount));

/** 月末残高見込み（開始残高 + 見込み純増減） */
export const projectedEndBalance = (m: Month): number => m.startBalance + plannedNet(m);

/** 実績ベースの現在残高（開始残高 + 実績純増減） */
export const actualEndBalance = (m: Month): number => m.startBalance + actualNet(m);

export const plannedIncome = (m: Month): number =>
  sum(m.budgetItems.filter((i) => i.plannedAmount > 0).map((i) => i.plannedAmount));

/** 見込み支出の合計（負の値で返す） */
export const plannedExpense = (m: Month): number =>
  sum(m.budgetItems.filter((i) => i.plannedAmount < 0).map((i) => i.plannedAmount));

export const actualIncome = (m: Month): number =>
  sum(
    m.transactions
      .filter((t) => t.planActual === '実績' && t.amount > 0)
      .map((t) => t.amount),
  );

/** 実績支出の合計（負の値で返す） */
export const actualExpense = (m: Month): number =>
  sum(
    m.transactions
      .filter((t) => t.planActual === '実績' && t.amount < 0)
      .map((t) => t.amount),
  );

/** 見込みベースの死守判定 */
export const judge = (m: Month): Judgment =>
  projectedEndBalance(m) >= m.defenseLine ? 'OK' : '危険';

/** 実績ベースの死守判定 */
export const actualJudge = (m: Month): Judgment =>
  actualEndBalance(m) >= m.defenseLine ? 'OK' : '危険';

export interface CategorySummary {
  category: string;
  /** 支出予算（正の値） */
  budget: number;
  /** 実績支出（正の値） */
  spent: number;
  /** 残り（budget - spent。マイナスは超過） */
  remaining: number;
  ratio: number;
}

/** カテゴリごとの支出予算・実績・残りを集計（支出項目のみ） */
export const expenseCategorySummary = (m: Month): CategorySummary[] => {
  const map = new Map<string, { budget: number; spent: number }>();
  for (const i of m.budgetItems) {
    if (i.plannedAmount < 0) {
      const c = map.get(i.category) ?? { budget: 0, spent: 0 };
      c.budget += -i.plannedAmount;
      map.set(i.category, c);
    }
  }
  for (const t of m.transactions) {
    if (t.planActual === '実績' && t.amount < 0) {
      const c = map.get(t.category) ?? { budget: 0, spent: 0 };
      c.spent += -t.amount;
      map.set(t.category, c);
    }
  }
  return [...map.entries()]
    .map(([category, v]) => ({
      category,
      budget: v.budget,
      spent: v.spent,
      remaining: v.budget - v.spent,
      ratio: v.budget > 0 ? v.spent / v.budget : v.spent > 0 ? 1 : 0,
    }))
    .sort((a, b) => b.budget - a.budget);
};

/** 予算項目ごとの実績・残り */
export interface ItemSummary {
  itemId: string;
  name: string;
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  ratio: number;
}

export const expenseItemSummary = (m: Month): ItemSummary[] => {
  return m.budgetItems
    .filter((i) => i.plannedAmount < 0)
    .map((i) => {
      const budget = -i.plannedAmount;
      const spent = -sum(
        m.transactions
          .filter(
            (t) =>
              t.planActual === '実績' &&
              t.amount < 0 &&
              (t.itemId === i.id || (!t.itemId && t.category === i.category)),
          )
          .map((t) => t.amount),
      );
      return {
        itemId: i.id,
        name: i.name,
        category: i.category,
        budget,
        spent,
        remaining: budget - spent,
        ratio: budget > 0 ? spent / budget : spent > 0 ? 1 : 0,
      };
    });
};

/** 今月あと使える総額（支出予算 - 実績支出） */
export const remainingToSpend = (m: Month): number =>
  -plannedExpense(m) - -actualExpense(m);
