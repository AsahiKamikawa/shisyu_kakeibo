import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BudgetData,
  BudgetItem,
  CarryoverMode,
  Month,
  Transaction,
  TxTemplate,
} from '../types';
import { createSeedData } from '../data/seed';
import { projectedEndBalance, actualEndBalance } from '../lib/calc';
import { monthLabel, nextMonthId } from '../lib/format';

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

interface BudgetState extends BudgetData {
  setCurrentMonth: (id: string) => void;
  setCarryoverMode: (mode: CarryoverMode) => void;

  addTransaction: (monthId: string, t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (monthId: string, t: Transaction) => void;
  deleteTransaction: (monthId: string, txId: string) => void;

  addBudgetItem: (monthId: string, item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (monthId: string, item: BudgetItem) => void;
  deleteBudgetItem: (monthId: string, itemId: string) => void;

  updateMonthMeta: (
    monthId: string,
    patch: Partial<Pick<Month, 'label' | 'startBalance' | 'assumedSalary' | 'defenseLine'>>,
  ) => void;
  createMonth: (sourceMonthId?: string) => string;
  copyBudgetItemsFrom: (targetMonthId: string, sourceMonthId: string) => void;
  deleteMonth: (monthId: string) => void;

  addCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
  setCategoryColor: (name: string, color: string) => void;

  addTemplate: (t: Omit<TxTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;

  importData: (data: BudgetData) => void;
  resetData: () => void;
}

const updateMonth = (
  months: Month[],
  monthId: string,
  fn: (m: Month) => Month,
): Month[] => months.map((m) => (m.id === monthId ? fn(m) : m));

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      ...createSeedData(),

      setCurrentMonth: (id) => set({ currentMonthId: id }),
      setCarryoverMode: (mode) => set({ carryoverMode: mode }),

      addTransaction: (monthId, t) =>
        set((s) => ({
          months: updateMonth(s.months, monthId, (m) => ({
            ...m,
            transactions: [...m.transactions, { ...t, id: uid() }],
          })),
        })),

      updateTransaction: (monthId, t) =>
        set((s) => ({
          months: updateMonth(s.months, monthId, (m) => ({
            ...m,
            transactions: m.transactions.map((x) => (x.id === t.id ? t : x)),
          })),
        })),

      deleteTransaction: (monthId, txId) =>
        set((s) => ({
          months: updateMonth(s.months, monthId, (m) => ({
            ...m,
            transactions: m.transactions.filter((x) => x.id !== txId),
          })),
        })),

      addBudgetItem: (monthId, item) =>
        set((s) => ({
          months: updateMonth(s.months, monthId, (m) => ({
            ...m,
            budgetItems: [...m.budgetItems, { ...item, id: uid() }],
          })),
        })),

      updateBudgetItem: (monthId, item) =>
        set((s) => ({
          months: updateMonth(s.months, monthId, (m) => ({
            ...m,
            budgetItems: m.budgetItems.map((x) => (x.id === item.id ? item : x)),
          })),
        })),

      deleteBudgetItem: (monthId, itemId) =>
        set((s) => ({
          months: updateMonth(s.months, monthId, (m) => ({
            ...m,
            budgetItems: m.budgetItems.filter((x) => x.id !== itemId),
          })),
        })),

      updateMonthMeta: (monthId, patch) =>
        set((s) => ({
          months: updateMonth(s.months, monthId, (m) => ({ ...m, ...patch })),
        })),

      createMonth: (sourceMonthId) => {
        const s = get();
        const source =
          s.months.find((m) => m.id === sourceMonthId) ??
          s.months[s.months.length - 1];
        const newId = source ? nextMonthId(source.id) : '2026-06';
        if (s.months.some((m) => m.id === newId)) {
          set({ currentMonthId: newId });
          return newId;
        }
        const carryBalance = source
          ? s.carryoverMode === 'actual'
            ? actualEndBalance(source)
            : projectedEndBalance(source)
          : 0;
        const newItems: BudgetItem[] = source
          ? source.budgetItems.map((i) => ({ ...i, id: uid() }))
          : [];
        // 固定費（recurring）は「予定」取引として毎月1日に自動計上する
        const autoTx: Transaction[] = newItems
          .filter((i) => i.recurring && i.plannedAmount !== 0)
          .map((i) => ({
            id: uid(),
            date: `${newId}-01`,
            content: i.name,
            category: i.category,
            itemId: i.id,
            amount: i.plannedAmount,
            planActual: '予定',
          }));
        const newMonth: Month = {
          id: newId,
          label: monthLabel(newId),
          startBalance: carryBalance,
          assumedSalary: source?.assumedSalary ?? 200000,
          defenseLine: carryBalance,
          budgetItems: newItems,
          transactions: autoTx,
        };
        set({
          months: [...s.months, newMonth].sort((a, b) => a.id.localeCompare(b.id)),
          currentMonthId: newId,
        });
        return newId;
      },

      copyBudgetItemsFrom: (targetMonthId, sourceMonthId) =>
        set((s) => {
          const source = s.months.find((m) => m.id === sourceMonthId);
          if (!source) return s;
          return {
            months: updateMonth(s.months, targetMonthId, (m) => ({
              ...m,
              budgetItems: source.budgetItems.map((i) => ({ ...i, id: uid() })),
            })),
          };
        }),

      deleteMonth: (monthId) =>
        set((s) => {
          if (s.months.length <= 1) return s;
          const months = s.months.filter((m) => m.id !== monthId);
          const currentMonthId =
            s.currentMonthId === monthId ? months[0].id : s.currentMonthId;
          return { months, currentMonthId };
        }),

      addCategory: (name) =>
        set((s) =>
          s.categories.includes(name)
            ? s
            : { categories: [...s.categories, name] },
        ),

      renameCategory: (oldName, newName) =>
        set((s) => {
          const categoryColors = { ...s.categoryColors };
          if (categoryColors[oldName]) {
            categoryColors[newName] = categoryColors[oldName];
            delete categoryColors[oldName];
          }
          return {
            categories: s.categories.map((c) => (c === oldName ? newName : c)),
            categoryColors,
            months: s.months.map((m) => ({
              ...m,
              budgetItems: m.budgetItems.map((i) =>
                i.category === oldName ? { ...i, category: newName } : i,
              ),
              transactions: m.transactions.map((t) =>
                t.category === oldName ? { ...t, category: newName } : t,
              ),
            })),
          };
        }),

      deleteCategory: (name) =>
        set((s) => {
          const categoryColors = { ...s.categoryColors };
          delete categoryColors[name];
          return {
            categories: s.categories.filter((c) => c !== name),
            categoryColors,
          };
        }),

      setCategoryColor: (name, color) =>
        set((s) => ({
          categoryColors: { ...s.categoryColors, [name]: color },
        })),

      addTemplate: (t) =>
        set((s) => ({ templates: [...s.templates, { ...t, id: uid() }] })),

      deleteTemplate: (id) =>
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

      importData: (data) =>
        set(() => ({
          categories: data.categories,
          months: data.months,
          currentMonthId: data.currentMonthId,
          carryoverMode: data.carryoverMode,
          templates: data.templates ?? [],
          categoryColors: data.categoryColors ?? {},
        })),

      resetData: () => set(() => ({ ...createSeedData() })),
    }),
    {
      name: 'kakeibo-budget-data',
      version: 3,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<BudgetData>;
        if (version < 2 && !Array.isArray(state.templates)) {
          state.templates = [];
        }
        if (version < 3 && typeof state.categoryColors !== 'object') {
          state.categoryColors = {};
        }
        return state as BudgetData;
      },
    },
  ),
);

/** 現在月を取得（存在しなければ先頭月） */
export const useCurrentMonth = (): Month => {
  return useBudgetStore((s) => {
    return s.months.find((m) => m.id === s.currentMonthId) ?? s.months[0];
  });
};
