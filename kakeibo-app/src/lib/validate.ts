import type {
  BudgetData,
  BudgetItem,
  Month,
  Transaction,
  TxTemplate,
} from '../types';

export interface ValidationResult {
  ok: boolean;
  /** ok=false のときの理由（日本語） */
  error?: string;
  /** ok=true のとき、欠損フィールドを補完した正規化済みデータ */
  data?: BudgetData;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

function normalizeTransaction(v: unknown): Transaction | null {
  if (!isObject(v)) return null;
  if (!isString(v.id) || !isString(v.date) || !isNumber(v.amount)) return null;
  if (!isString(v.category) || !isString(v.content)) return null;
  if (v.planActual !== '予定' && v.planActual !== '実績') return null;
  return {
    id: v.id,
    date: v.date,
    content: v.content,
    category: v.category,
    itemId: isString(v.itemId) ? v.itemId : null,
    amount: v.amount,
    planActual: v.planActual,
    memo: isString(v.memo) ? v.memo : undefined,
  };
}

function normalizeBudgetItem(v: unknown): BudgetItem | null {
  if (!isObject(v)) return null;
  if (!isString(v.id) || !isString(v.name) || !isString(v.category)) return null;
  if (!isNumber(v.plannedAmount)) return null;
  return {
    id: v.id,
    name: v.name,
    category: v.category,
    plannedAmount: v.plannedAmount,
    memo: isString(v.memo) ? v.memo : undefined,
    recurring: typeof v.recurring === 'boolean' ? v.recurring : undefined,
  };
}

function normalizeMonth(v: unknown): Month | null {
  if (!isObject(v)) return null;
  if (!isString(v.id) || !isString(v.label)) return null;
  if (
    !isNumber(v.startBalance) ||
    !isNumber(v.assumedSalary) ||
    !isNumber(v.defenseLine)
  ) {
    return null;
  }
  if (!Array.isArray(v.budgetItems) || !Array.isArray(v.transactions)) return null;

  const budgetItems: BudgetItem[] = [];
  for (const raw of v.budgetItems) {
    const item = normalizeBudgetItem(raw);
    if (!item) return null;
    budgetItems.push(item);
  }
  const transactions: Transaction[] = [];
  for (const raw of v.transactions) {
    const t = normalizeTransaction(raw);
    if (!t) return null;
    transactions.push(t);
  }
  return {
    id: v.id,
    label: v.label,
    startBalance: v.startBalance,
    assumedSalary: v.assumedSalary,
    defenseLine: v.defenseLine,
    budgetItems,
    transactions,
  };
}

function normalizeTemplates(v: unknown): TxTemplate[] {
  if (!Array.isArray(v)) return [];
  const out: TxTemplate[] = [];
  for (const raw of v) {
    if (!isObject(raw)) continue;
    if (!isString(raw.id) || !isString(raw.label) || !isString(raw.content)) continue;
    if (!isString(raw.category)) continue;
    if (raw.kind !== 'income' && raw.kind !== 'expense') continue;
    out.push({
      id: raw.id,
      label: raw.label,
      content: raw.content,
      category: raw.category,
      itemId: isString(raw.itemId) ? raw.itemId : null,
      kind: raw.kind,
      amount: isNumber(raw.amount) ? raw.amount : undefined,
    });
  }
  return out;
}

function normalizeCategoryColors(v: unknown): Record<string, string> {
  if (!isObject(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v)) {
    if (isString(val)) out[k] = val;
  }
  return out;
}

/**
 * import されたデータを検証し、欠損フィールドを補完して返す。
 * 必須フィールドが壊れている場合は ok=false を返す。
 */
export function validateBudgetData(input: unknown): ValidationResult {
  if (!isObject(input)) {
    return { ok: false, error: 'ファイルの中身がオブジェクトではありません。' };
  }
  if (!Array.isArray(input.categories) || !input.categories.every(isString)) {
    return { ok: false, error: 'categories が不正です。' };
  }
  if (!Array.isArray(input.months) || input.months.length === 0) {
    return { ok: false, error: 'months がありません。' };
  }

  const months: Month[] = [];
  for (const raw of input.months) {
    const m = normalizeMonth(raw);
    if (!m) {
      return { ok: false, error: '月データの形式が正しくありません。' };
    }
    months.push(m);
  }

  const currentMonthId =
    isString(input.currentMonthId) &&
    months.some((m) => m.id === input.currentMonthId)
      ? input.currentMonthId
      : months[0].id;

  const carryoverMode =
    input.carryoverMode === 'actual' ? 'actual' : 'projected';

  return {
    ok: true,
    data: {
      categories: input.categories,
      months,
      currentMonthId,
      carryoverMode,
      templates: normalizeTemplates(input.templates),
      categoryColors: normalizeCategoryColors(input.categoryColors),
    },
  };
}
