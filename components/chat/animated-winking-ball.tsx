'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedAudioLines } from './animated-audio-lines';

interface AnimatedWinkingBallProps {
  isRecording?: boolean;
}

export function AnimatedWinkingBall({ isRecording = false }: AnimatedWinkingBallProps) {
  return (
    <div className="flex w-full items-center justify-center p-8 h-[240px]">
      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            key="audio-lines"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <AnimatedAudioLines />
          </motion.div>
        ) : (
          <motion.video
            key="bot-video"
            src="/bot_boomerang.mp4"
            autoPlay
            loop
            muted
            playsInline
            width={500}
            height={500}
            className="rounded-full object-cover"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              scale: { duration: 0.4, ease: 'easeOut' },
              opacity: { duration: 0.4 },
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
