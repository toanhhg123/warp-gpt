import { MoreHorizontalIcon, PanelLeftIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type ChatHeaderProps = {
  onOpenSidebar: () => void;
};

export function ChatHeader({ onOpenSidebar }: ChatHeaderProps) {
  return (
    <header className="border-border bg-background/90 z-20 border-b px-3 py-2 backdrop-blur-sm sm:px-4">
      <div className="flex w-full items-center gap-2">
        <Button
          className="lg:hidden"
          size="icon-sm"
          variant="ghost"
          onClick={onOpenSidebar}
        >
          <PanelLeftIcon />
        </Button>
        <div className="mr-auto min-w-0">
          <p className="truncate text-sm font-medium">New UI mockup</p>
          <p className="text-muted-foreground text-xs">
            ChatGPT 4.1 style workspace
          </p>
        </div>
        <Button size="sm" variant="outline">
          <SparklesIcon data-icon="inline-start" />
          Upgrade
        </Button>
        <Button size="icon-sm" variant="ghost">
          <MoreHorizontalIcon />
        </Button>
      </div>
    </header>
  );
}
