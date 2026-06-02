import { describe, it, expect, beforeEach } from 'vitest';
import { useBudgetStore } from './budgetStore';

const get = () => useBudgetStore.getState();

beforeEach(() => {
  get().resetData();
});

describe('createMonth', () => {
  it('繰越残高を引き継ぎ、固定費の予定取引を自動生成する', () => {
    // 2026-08 に固定費（recurring）を追加
    get().addBudgetItem('2026-08', {
      name: '家賃',
      category: '固定費',
      plannedAmount: -50000,
      recurring: true,
    });

    const newId = get().createMonth('2026-08');
    expect(newId).toBe('2026-09');

    const created = get().months.find((m) => m.id === '2026-09')!;
    expect(created).toBeDefined();
    // projected 繰越: startBalance(0) + plannedNet(-50000)
    expect(created.startBalance).toBe(-50000);

    const autoTx = created.transactions.filter((t) => t.planActual === '予定');
    expect(autoTx).toHaveLength(1);
    expect(autoTx[0].content).toBe('家賃');
    expect(autoTx[0].amount).toBe(-50000);
    // 自動生成された取引は、コピー後の新しい項目 id を指す
    const rentItem = created.budgetItems.find((i) => i.name === '家賃')!;
    expect(autoTx[0].itemId).toBe(rentItem.id);
  });

  it('既存の月 id を作ろうとした場合はその月へ切り替えるだけ', () => {
    const before = get().months.length;
    const id = get().createMonth('2026-06'); // -> 2026-07 は既存
    expect(id).toBe('2026-07');
    expect(get().months.length).toBe(before);
    expect(get().currentMonthId).toBe('2026-07');
  });
});

describe('カテゴリ色とリネーム/削除の追従', () => {
  it('renameCategory で色キーが移行する', () => {
    get().setCategoryColor('変動費', '#111111');
    get().renameCategory('変動費', '変動費2');
    expect(get().categoryColors['変動費2']).toBe('#111111');
    expect(get().categoryColors['変動費']).toBeUndefined();
    expect(get().categories).toContain('変動費2');
  });

  it('deleteCategory で色キーが削除される', () => {
    get().setCategoryColor('予備費', '#222222');
    get().deleteCategory('予備費');
    expect(get().categoryColors['予備費']).toBeUndefined();
    expect(get().categories).not.toContain('予備費');
  });
});

describe('importData', () => {
  it('テンプレ・カテゴリ色を含めて差し替える', () => {
    get().importData({
      categories: ['収入'],
      currentMonthId: '2030-01',
      carryoverMode: 'actual',
      templates: [
        { id: 't1', label: 'コンビニ', content: 'コンビニ', category: '収入', kind: 'expense' },
      ],
      categoryColors: { 収入: '#abcdef' },
      months: [
        {
          id: '2030-01',
          label: '1月',
          startBalance: 5000,
          assumedSalary: 0,
          defenseLine: 0,
          budgetItems: [],
          transactions: [],
        },
      ],
    });
    expect(get().categories).toEqual(['収入']);
    expect(get().currentMonthId).toBe('2030-01');
    expect(get().carryoverMode).toBe('actual');
    expect(get().templates).toHaveLength(1);
    expect(get().categoryColors).toEqual({ 収入: '#abcdef' });
  });
});
