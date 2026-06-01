export const yen = (n: number): string => {
  const sign = n < 0 ? '-' : '';
  return `${sign}\u00A5${Math.abs(Math.round(n)).toLocaleString('ja-JP')}`;
};

/** 記号なしの数値（カンマ区切り） */
export const num = (n: number): string => Math.round(n).toLocaleString('ja-JP');

/** 符号付き（+/-）の円表記 */
export const signedYen = (n: number): string => {
  if (n > 0) return `+${yen(n)}`;
  return yen(n);
};

/** 'YYYY-MM' -> 'YYYY年M月' */
export const monthTitle = (id: string): string => {
  const [y, m] = id.split('-');
  return `${y}年${Number(m)}月`;
};

export const todayISO = (): string => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

/** 'YYYY-MM' の翌月 id を返す */
export const nextMonthId = (id: string): string => {
  const [y, m] = id.split('-').map(Number);
  const date = new Date(y, m - 1 + 1, 1);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${mm}`;
};

export const monthLabel = (id: string): string => `${Number(id.split('-')[1])}月`;
