import type { ReactNode } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function GripIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="6" r="1.4" fill="currentColor" />
      <circle cx="15" cy="6" r="1.4" fill="currentColor" />
      <circle cx="9" cy="12" r="1.4" fill="currentColor" />
      <circle cx="15" cy="12" r="1.4" fill="currentColor" />
      <circle cx="9" cy="18" r="1.4" fill="currentColor" />
      <circle cx="15" cy="18" r="1.4" fill="currentColor" />
    </svg>
  );
}

function SortableRow({
  id,
  render,
}: {
  id: string;
  render: (handle: ReactNode, isDragging: boolean) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative',
    zIndex: isDragging ? 10 : undefined,
  };

  const handle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      className="grid h-9 w-8 shrink-0 cursor-grab touch-none place-items-center text-slate-300 active:cursor-grabbing active:text-violet-400"
      aria-label="ドラッグして並べ替え"
    >
      <GripIcon />
    </button>
  );

  return (
    <div ref={setNodeRef} style={style}>
      {render(handle, isDragging)}
    </div>
  );
}

export function SortableList<T>({
  items,
  getId,
  onReorder,
  renderRow,
}: {
  items: T[];
  getId: (item: T) => string;
  /** 並べ替え後の id 配列を受け取る */
  onReorder: (orderedIds: string[]) => void;
  renderRow: (item: T, handle: ReactNode, isDragging: boolean) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    }),
  );
  const ids = items.map(getId);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(ids, oldIndex, newIndex));
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableRow
            key={getId(item)}
            id={getId(item)}
            render={(handle, isDragging) => renderRow(item, handle, isDragging)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
