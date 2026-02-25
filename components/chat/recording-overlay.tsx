import { MicIcon, SquareIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RecordingOverlayProps = {
  duration: string;
  isVisible: boolean;
  onStop: () => void;
  reducedMotion?: boolean;
};

export function RecordingOverlay({
  duration,
  isVisible,
  onStop,
  reducedMotion = false,
}: RecordingOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/55 p-6 backdrop-blur-md">
      <div className="border-border bg-background/90 relative flex w-full max-w-sm flex-col items-center border px-6 py-8 text-center shadow-2xl">
        <div className="relative flex size-36 items-center justify-center">
          <div
            className={cn(
              "border-primary/45 absolute inset-0 rounded-full border",
              reducedMotion
                ? "opacity-40"
                : "animate-ping animation-duration-[2s]",
            )}
          />
          <div
            className={cn(
              "border-primary/35 absolute inset-3 rounded-full border",
              reducedMotion ? "" : "animate-spin animation-duration-[4s]",
            )}
          />
          <div
            className={cn(
              "from-primary via-primary/70 to-cyan-300 relative z-10 flex size-24 items-center justify-center rounded-full bg-linear-to-br shadow-[0_0_55px_rgba(34,139,230,0.5)]",
              reducedMotion ? "" : "animate-spin animation-duration-[2.2s]",
            )}
          >
            <MicIcon className="text-primary-foreground size-9" />
          </div>
        </div>

        <p className="mt-6 text-base font-semibold">Recording in progress</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Duration: {duration}
        </p>

        <Button className="mt-6" variant="destructive" onClick={onStop}>
          <SquareIcon data-icon="inline-start" />
          Stop recording
        </Button>
      </div>
    </div>
  );
}
