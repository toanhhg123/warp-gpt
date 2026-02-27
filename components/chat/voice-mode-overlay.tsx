import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyboardIcon, MoreHorizontalIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AnimatedWinkingBall } from './animated-winking-ball';
import { TypingEffect } from './typing-effect';

export type VoiceModeOverlayProps = {
  duration: string;
  isVisible: boolean;
  onStop: () => void;
  onClose: () => void;
  reducedMotion?: boolean;
  text: string;
};

export function VoiceModeOverlay({
  duration,
  isVisible,
  onStop,
  onClose,
  reducedMotion = false,
  text,
}: VoiceModeOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
          className="fixed inset-0 z-50 flex flex-col bg-background"
        >
          {/* Top Section */}
          <div className="flex w-full items-center justify-center p-6 text-sm tabular-nums text-muted-foreground">
            {duration}
          </div>

          {/* Middle Section: Avatar and Text */}
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <motion.div
              layoutId="bot-avatar"
              className="mb-4"
            >
              <AnimatedWinkingBall isRecording={text.trim() !== ''} />
            </motion.div>
            <div className="min-h-[60px] max-w-md text-center text-xl font-medium sm:text-2xl h-[100px] overflow-y-auto w-full">
              {text ? (
                <TypingEffect
                  text={text}
                  speed={30}
                />
              ) : (
                <span className="text-muted-foreground/50">Listening...</span>
              )}
            </div>
          </div>

          {/* Bottom Section: Controls */}
          <div className="flex w-full items-center justify-center p-6 sm:px-12 pb-12 gap-8">
            <Button
              variant="ghost"
              size="icon"
              className="size-12 rounded-full bg-muted/50 hover:bg-muted"
              onClick={onClose}
            >
              <KeyboardIcon className="size-5" />
            </Button>

            <Button
              size="icon"
              className="size-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-xl"
              onClick={onStop}
            >
              <div className="size-6 rounded bg-white" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-12 rounded-full bg-muted/50 hover:bg-muted"
            >
              <MoreHorizontalIcon className="size-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
