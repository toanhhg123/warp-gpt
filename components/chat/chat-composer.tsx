import { MicIcon, PaperclipIcon, SendHorizontalIcon, SquareIcon } from 'lucide-react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ChatComposerProps = {
  audioUrl: string | null;
  formattedDuration: string;

  isRecording: boolean;
  isSpeechSupported: boolean;
  onSend: () => void;
  onTextChange: (value: string) => void;
  onToggleRecording: () => void;
  recordingError: string | null;
  text: string;
};

export function ChatComposer({
  audioUrl,
  formattedDuration,
  isRecording,
  isSpeechSupported,
  onSend,
  onTextChange,
  onToggleRecording,
  recordingError,
  text,
}: ChatComposerProps) {
  return (
    <footer className="border-border bg-background/95 border-t p-3 backdrop-blur-md sm:p-4">
      <div className="w-full">
        <InputGroup className="h-auto items-end rounded-2xl overflow-hidden">
          <InputGroupAddon
            align="block-start"
            className="border-border border-b bg-white"
          >
            <Button
              size="xs"
              variant="ghost"
              className="rounded-lg"
            >
              ChatGPT 4.1
            </Button>
            <Button
              size="xs"
              variant="ghost"
              className="rounded-lg"
            >
              Standard
            </Button>
          </InputGroupAddon>

          <InputGroupInput
            value={text}
            placeholder="Message ChatGPT"
            onChange={(event) => onTextChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !isRecording) {
                event.preventDefault();
                onSend();
              }
            }}
          />

          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Attach"
              size="icon-sm"
              variant="ghost"
              className="rounded-lg text-foreground"
            >
              <PaperclipIcon />
            </InputGroupButton>
            <InputGroupButton
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              size="icon-sm"
              variant={isRecording ? 'destructive' : 'ghost'}
              onClick={onToggleRecording}
              className="rounded-lg text-foreground"
            >
              {isRecording ? <SquareIcon /> : <MicIcon />}
            </InputGroupButton>
            <InputGroupButton
              aria-label="Send message"
              size="icon-sm"
              variant="default"
              disabled={isRecording}
              onClick={text.trim() === '' ? undefined : onSend}
              className={cn(
                'rounded-full text-background hover:bg-foreground/90',
                text.trim() === '' ? 'opacity-50 cursor-not-allowed' : '',
              )}
            >
              <SendHorizontalIcon />
            </InputGroupButton>{' '}
          </InputGroupAddon>
        </InputGroup>

        <div className="mt-2 space-y-2">
          {isRecording ? (
            <p className="text-destructive text-xs font-medium">
              Recording... {formattedDuration}
              {isSpeechSupported ? ' | Voice to text: ON' : ''}
            </p>
          ) : null}

          {audioUrl ? (
            <div className="border-border bg-muted/30 rounded-2xl border p-2">
              <p className="text-muted-foreground mb-1 px-1 text-[11px]">Recorded audio preview</p>
              <audio
                className="w-full"
                controls
                preload="metadata"
                src={audioUrl}
              />
            </div>
          ) : null}

          {recordingError ? <p className="text-destructive text-xs">{recordingError}</p> : null}
        </div>

        <p className="text-muted-foreground mt-2 text-center text-[11px]">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </footer>
  );
}
