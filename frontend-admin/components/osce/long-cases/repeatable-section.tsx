import type { ReactNode } from "react";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { Button } from "@/components/ui/button";

interface RepeatableSectionProps {
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
}

export function RepeatableSection({
  title,
  description,
  addLabel,
  onAdd,
  isEmpty,
  emptyMessage,
  children,
}: RepeatableSectionProps) {
  return (
    <section className="grid gap-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <LuPlus aria-hidden="true" className="size-4" />
          {addLabel}
        </Button>
      </header>
      {isEmpty ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-4">{children}</div>
      )}
    </section>
  );
}

interface ItemCardProps {
  title: string;
  onRemove: () => void;
  /** Extra header controls, e.g. reorder buttons. */
  actions?: ReactNode;
  children: ReactNode;
}

export function ItemCard({ title, onRemove, actions, children }: ItemCardProps) {
  return (
    <div role="group" aria-label={title} className="grid gap-4 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{title}</span>
        <div className="flex items-center gap-1">
          {actions}
          <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${title}`} onClick={onRemove}>
            <LuTrash2 aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}