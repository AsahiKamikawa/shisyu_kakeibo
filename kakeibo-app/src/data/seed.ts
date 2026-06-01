import type { BudgetData, BudgetItem } from '../types';

let counter = 0;
const id = (prefix: string): string => `${prefix}-${++counter}`;

// 公開（GitHub Pages）用の初期データは「項目名・カテゴリのみ」で、金額はすべて 0。
// 実際の金額は端末側で入力するか、設定からバックアップJSONを読み込んで復元する。
const item = (name: string, category: string): BudgetItem => ({
  id: id('bi'),
  name,
  category,
  plannedAmount: 0,
});

/** 設定シート由来のカテゴリ一覧 */
export const DEFAULT_CATEGORIES: string[] = [
  '開始残高',
  '収入',
  '収入/借入',
  '返済',
  '固定費',
  '臨時支出',
  '生活費',
  '生活費・返済',
  'カード',
  '変動費',
  '予備費',
];

export const createSeedData = (): BudgetData => ({
  categories: [...DEFAULT_CATEGORIES],
  currentMonthId: '2026-06',
  carryoverMode: 'projected',
  templates: [],
  categoryColors: {},
  months: [
    {
      id: '2026-06',
      label: '6月',
      startBalance: 0,
      assumedSalary: 0,
      defenseLine: 0,
      budgetItems: [
        item('追加借入', '収入/借入'),
        item('彼氏へ返済', '返済'),
        item('定期代', '固定費'),
        item('家電・LED', '臨時支出'),
        item('生活費予算', '生活費'),
        item('給与', '収入'),
        item('カード引き落とし', 'カード'),
        item('賞与', '収入'),
      ],
      transactions: [],
    },
    {
      id: '2026-07',
      label: '7月',
      startBalance: 0,
      assumedSalary: 0,
      defenseLine: 0,
      budgetItems: [
        item('給与', '収入'),
        item('生活費・返済', '生活費・返済'),
      ],
      transactions: [],
    },
    {
      id: '2026-08',
      label: '8月',
      startBalance: 0,
      assumedSalary: 0,
      defenseLine: 0,
      budgetItems: [
        item('給与', '収入'),
        item('家賃・ネット込み', '固定費'),
        item('返済', '返済'),
        item('食費', '変動費'),
        item('光熱費', '固定費'),
        item('通信費', '固定費'),
        item('ジム', '固定費'),
        item('サブスク', '固定費'),
        item('日用品・医療', '変動費'),
        item('予備費', '予備費'),
      ],
      transactions: [],
    },
  ],
});
