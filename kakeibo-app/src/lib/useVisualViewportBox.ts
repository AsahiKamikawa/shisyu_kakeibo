import { useEffect, useState } from 'react';

export interface VisualViewportBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

const readBox = (): VisualViewportBox => {
  const vv = window.visualViewport;
  if (!vv) {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  return {
    top: vv.offsetTop,
    left: vv.offsetLeft,
    width: vv.width,
    height: vv.height,
  };
};

/**
 * iOS のソフトキーボード表示時に「実際に見えている領域」に合わせるための矩形。
 * fixed inset-0 ではキーボード裏に UI が残るため、モーダルはこの box で覆う。
 */
export function useVisualViewportBox(): VisualViewportBox {
  const [box, setBox] = useState(readBox);

  useEffect(() => {
    const vv = window.visualViewport;
    const update = () => setBox(readBox());
    update();
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    // キーボードアニメーション後に再計算
    const scheduleUpdate = () => {
      update();
      window.setTimeout(update, 100);
      window.setTimeout(update, 350);
    };
    document.addEventListener('focusin', scheduleUpdate);
    // プルダウン選択・Enter でキーボードが閉じたあともレイアウトを追従
    document.addEventListener('focusout', scheduleUpdate);
    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      document.removeEventListener('focusin', scheduleUpdate);
      document.removeEventListener('focusout', scheduleUpdate);
    };
  }, []);

  return box;
}
