export type PlanActual = '予定' | '実績';

/** 見込み・月額予算の1行（収入はプラス、支出はマイナスで保持） */
export interface BudgetItem {
  id: string;
  name: string;
  category: string;
  /** 収入は + 、支出は - で保持する見込み金額 */
  plannedAmount: number;
  memo?: string;
  /** 固定費など、毎月の新規作成時に「予定」取引を自動計上する */
  recurring?: boolean;
}

/** よく使う入力のテンプレート */
export interface TxTemplate {
  id: string;
  label: string;
  content: string;
  category: string;
  itemId?: string | null;
  kind: 'income' | 'expense';
  /** 既定金額（未設定なら入力時に空欄） */
  amount?: number;
}

/** 実績入力欄の1行（収入はプラス、支出はマイナス） */
export interface Transaction {
  id: string;
  /** ISO 形式 yyyy-mm-dd */
  date: string;
  content: string;
  category: string;
  /** 関連する予算項目 id（任意） */
  itemId?: string | null;
  amount: number;
  planActual: PlanActual;
  memo?: string;
}

export interface Month {
  /** 'YYYY-MM' */
  id: string;
  /** 表示名（例: 6月） */
  label: string;
  startBalance: number;
  assumedSalary: number;
  /** 死守ライン（月末残高がこれを下回ると危険） */
  defenseLine: number;
  budgetItems: BudgetItem[];
  transactions: Transaction[];
}

export type CarryoverMode = 'projected' | 'actual';

export interface BudgetData {
  categories: string[];
  months: Month[];
  currentMonthId: string;
  /** 翌月の開始残高に「見込み」か「実績ベース」どちらの月末残高を引き継ぐか */
  carryoverMode: CarryoverMode;
  /** よく使う入力テンプレート */
  templates: TxTemplate[];
}
