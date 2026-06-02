import { useRef, useState, type ReactNode } from 'react';

const ACTION_W = 88;

/**
 * 左スワイプで右側に削除ボタンを表示する行。
 * iOS のリスト操作に合わせた自前のタッチ実装（依存なし）。
 */
export function SwipeRow({
  children,
  onDelete,
  deleteLabel = '削除',
}: {
  children: ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
}) {
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startTranslate = useRef(0);
  const draggingRef = useRef(false);
  const moved = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startTranslate.current = x;
    draggingRef.current = true;
    moved.current = false;
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    const delta = e.touches[0].clientX - startX.current;
    if (Math.abs(delta) > 6) moved.current = true;
    const next = Math.min(0, Math.max(-ACTION_W, startTranslate.current + delta));
    setX(next);
  };

  const onTouchEnd = () => {
    draggingRef.current = false;
    setDragging(false);
    setX((prev) => (prev < -ACTION_W / 2 ? -ACTION_W : 0));
  };

  const open = x <= -ACTION_W / 2;

  // スワイプ中・開いている状態でのタップは、内側のボタン（編集）に伝えず
  // 行を閉じる動作にする
  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current || open) {
      e.preventDefault();
      e.stopPropagation();
      setX(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <button
        type="button"
        onClick={() => {
          setX(0);
          onDelete();
        }}
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-gradient-to-r from-rose-400 to-rose-500 text-sm font-bold text-white"
        style={{ width: ACTION_W }}
        aria-label={deleteLabel}
        tabIndex={open ? 0 : -1}
      >
        {deleteLabel}
      </button>
      <div
        className="relative bg-white"
        style={{
          transform: `translateX(${x}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
    </div>
  );
}
