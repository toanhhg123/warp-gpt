import { MessageSquareIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatSidebarProps = {
  conversations: string[];
  isOpen: boolean;
  onClose: () => void;
};

export function ChatSidebar({
  conversations,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "bg-muted/30 border-border fixed inset-y-2 left-2 z-40 w-72 border p-3 backdrop-blur-xl transition-transform duration-200 lg:static lg:inset-auto lg:translate-x-0 lg:border-0 lg:border-r",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <Button className="w-full justify-start" variant="outline">
            <PlusIcon data-icon="inline-start" />
            New chat
          </Button>
        </div>

        <div className="space-y-1">
          {conversations.map((item, idx) => (
            <button
              key={item}
              className={cn(
                "hover:bg-muted flex w-full items-center gap-2 border px-2.5 py-2 text-left text-xs transition-colors",
                idx === 0 ? "bg-muted border-border" : "border-transparent",
              )}
              type="button"
            >
              <MessageSquareIcon className="size-3.5" />
              <span className="truncate">{item}</span>
            </button>
          ))}
        </div>
      </aside>

      {isOpen ? (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          type="button"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}
