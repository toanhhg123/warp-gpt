import { AudioLines, MicIcon, PaperclipIcon, SendHorizontalIcon, SquareIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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

  isLoading: boolean;
  isRecording: boolean;
  isSpeechSupported: boolean;
  isSpeaking: boolean;
  isTalking: boolean;
  onSend: (overrideText?: string) => Promise<void>;
  onStopSpeaking: () => void;
  onTextChange: (value: string) => void;
  onToggleRecording: (mode?: 'audio' | 'voice') => void;
  recordingError: string | null;
  recordingMode: 'audio' | 'voice' | null;
  text: string;
  voiceText: string;
  onUnlock?: () => void;
};

export function ChatComposer({
  audioUrl,
  formattedDuration,
  isLoading,
  isRecording,
  isSpeechSupported,
  isSpeaking,
  onSend,
  onStopSpeaking,
  onTextChange,
  onToggleRecording,
  recordingError,
  recordingMode,
  text,
  voiceText,
  onUnlock,
}: ChatComposerProps) {
  return (
    <footer className="border-border bg-background/95 p-3 backdrop-blur-md sm:p-4">
      <div className="w-full">
        {(isRecording || isLoading || isSpeaking) &&
          (() => {
            // talking.gif = AI is responding or speaking
            // idle.gif = recording (listening to user)
            const isTalkingState = isLoading || isSpeaking;
            return (
              <div className="flex flex-col justify-center mb-4 items-center bg-transparent w-full">
                <div className="relative h-[80px] w-full max-w-[160px] flex items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    {!isTalkingState && (
                      <motion.img
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        src="/idle.gif"
                        className="absolute inset-0 h-full w-full object-contain bg-transparent"
                        alt="Idle"
                      />
                    )}
                    {isTalkingState && (
                      <motion.img
                        key="talking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        src="/talking.gif"
                        className="absolute inset-0 h-full w-full object-contain bg-transparent"
                        alt="Talking"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {voiceText && (
                  <p className="mt-2 text-sm text-center font-medium animate-pulse text-foreground/80">
                    {voiceText}
                  </p>
                )}
                {isSpeaking && (
                  <button
                    onClick={onStopSpeaking}
                    className="mt-2 text-xs text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2"
                  >
                    Stop speaking
                  </button>
                )}
              </div>
            );
          })()}
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
              if (event.key === 'Enter' && !event.shiftKey && !isRecording && !isLoading) {
                event.preventDefault();
                void onSend();
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
              aria-label={
                isRecording && recordingMode === 'audio' ? 'Stop recording' : 'Start recording'
              }
              size="icon-sm"
              variant={isRecording && recordingMode === 'audio' ? 'destructive' : 'ghost'}
              onClick={() => {
                onUnlock?.();
                onToggleRecording('audio');
              }}
              className="rounded-lg text-foreground"
            >
              {isRecording && recordingMode === 'audio' ? <SquareIcon /> : <MicIcon />}
            </InputGroupButton>
            <InputGroupButton
              aria-label={text.trim() === '' && !audioUrl ? 'Open voice mode' : 'Send message'}
              size="icon-sm"
              variant="default"
              disabled={(isRecording && recordingMode !== 'voice') || isLoading}
              onClick={(e) => {
                e.preventDefault();
                onUnlock?.();
                if ((text.trim() === '' && !audioUrl) || isRecording) {
                  onToggleRecording('voice');
                } else {
                  onSend();
                }
              }}
              className={cn('rounded-full text-background hover:bg-foreground/90 transition-all')}
            >
              {text.trim() === '' && !audioUrl ? (
                isRecording && recordingMode === 'voice' ? (
                  <SquareIcon />
                ) : (
                  <AudioLines />
                )
              ) : (
                <SendHorizontalIcon />
              )}
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
