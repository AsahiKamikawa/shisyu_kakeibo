/** カテゴリ色分け用のパステルパレット */
export const CATEGORY_PALETTE: string[] = [
  '#38bdf8', // sky
  '#818cf8', // indigo
  '#c084fc', // purple
  '#f0abfc', // fuchsia
  '#a78bfa', // violet
  '#60a5fa', // blue
  '#e879f9', // pink-purple
  '#34d399', // emerald
  '#fbbf24', // amber
  '#fb7185', // rose
  '#2dd4bf', // teal
  '#f472b6', // pink
];

/** 文字列から安定したハッシュを得る */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * カテゴリの表示色を返す。
 * overrides に指定があればそれを、なければ名前ハッシュでパレットから自動割当。
 */
export function colorForCategory(
  name: string,
  overrides?: Record<string, string>,
): string {
  if (overrides && overrides[name]) return overrides[name];
  return CATEGORY_PALETTE[hash(name) % CATEGORY_PALETTE.length];
}
