import { useEffect, useState } from 'react';

/**
 * iOS などソフトキーボード表示時に、レイアウトビューポート（innerHeight）と
 * 実際に見えている visualViewport の差分＝キーボードの高さを返す。
 * 下部固定のシート/ボタンをキーボードの上へ持ち上げるために使う。
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      // 端数の揺れを抑える
      setInset(kb > 1 ? Math.round(kb) : 0);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return inset;
}
