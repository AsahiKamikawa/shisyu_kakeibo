import type { ReactNode } from 'react';
import { useVisualViewportBox } from '../lib/useVisualViewportBox';

/** フォーカスした入力がキーボードに隠れないよう、少し遅れてスクロールする */
const scrollFocusedIntoView = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return;
  window.setTimeout(() => {
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, 320);
};

export function FormSheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  const vv = useVisualViewportBox();

  return (
    <div
      className="anim-fade fixed z-50 flex flex-col justify-end bg-violet-950/30 backdrop-blur-sm"
      style={{
        top: vv.top,
        left: vv.left,
        width: vv.width,
        height: vv.height,
      }}
      onClick={onClose}
    >
      <div
        className="anim-sheet flex max-h-full w-full max-w-md flex-col self-center rounded-t-3xl bg-white ring-1 ring-violet-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-5 pt-4">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-300" />
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        </div>

        <div
          className="form-sheet-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2 pt-3"
          onFocusCapture={(e) => scrollFocusedIntoView(e.target)}
        >
          {children}
        </div>

        <div className="form-sheet-footer shrink-0 safe-bottom border-t border-violet-100 bg-white px-5 pb-3 pt-3">
          {footer}
        </div>
      </div>
    </div>
  );
}
