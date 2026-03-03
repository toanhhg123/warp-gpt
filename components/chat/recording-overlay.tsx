import { MicIcon, SquareIcon } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

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
  return (
    <AlertDialog
      open={isVisible}
      onOpenChange={(open) => {
        if (!open) onStop();
      }}
    >
      <AlertDialogContent className="w-full max-w-sm flex flex-col items-center px-6 py-8 text-center sm:rounded-2xl border-border bg-background/95 backdrop-blur-md shadow-2xl gap-0">
        <AlertDialogHeader className="items-center sm:group-data-[size=default]/alert-dialog-content:place-items-center">
          <AlertDialogTitle className="sr-only">Recording in progress</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Currently recording your audio. Press stop to end.
          </AlertDialogDescription>

          <div className="relative flex size-36 items-center justify-center mb-6">
            <div
              className={cn(
                'border-primary/45 absolute inset-0 rounded-full border',
                reducedMotion ? 'opacity-40' : 'animate-ping animation-duration-[2s]',
              )}
            />
            <div
              className={cn(
                'border-primary/35 absolute inset-3 rounded-full border',
                reducedMotion ? '' : 'animate-spin animation-duration-[4s]',
              )}
            />
            <div
              className={cn(
                'from-primary via-primary/70 to-cyan-300 relative z-10 flex size-24 items-center justify-center rounded-full bg-linear-to-br shadow-[0_0_55px_rgba(34,139,230,0.5)]',
                reducedMotion ? '' : 'animate-spin animation-duration-[2.2s]',
              )}
            >
              <MicIcon className="text-primary-foreground size-9" />
            </div>
          </div>

          <p className="text-base font-semibold">Recording in progress</p>
          <p className="text-muted-foreground mt-1 text-sm">Duration: {duration}</p>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-8 sm:justify-center">
          <AlertDialogCancel
            variant="destructive"
            onClick={onStop}
            className="mt-0 w-full sm:w-auto"
          >
            <SquareIcon
              data-icon="inline-start"
              className="mr-2 h-4 w-4"
            />
            Stop recording
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
