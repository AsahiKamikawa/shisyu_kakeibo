import { describe, it, expect } from 'vitest';
import { CATEGORY_PALETTE, colorForCategory } from './colors';

describe('colorForCategory', () => {
  it('overrides にあればその色を返す', () => {
    expect(colorForCategory('食費', { 食費: '#123456' })).toBe('#123456');
  });

  it('未設定なら名前から決定論的にパレット色を割り当てる', () => {
    const a = colorForCategory('食費');
    const b = colorForCategory('食費');
    expect(a).toBe(b);
    expect(CATEGORY_PALETTE).toContain(a);
  });

  it('overrides が無い別カテゴリでも安定した色を返す', () => {
    expect(colorForCategory('固定費', {})).toBe(colorForCategory('固定費'));
  });
});
