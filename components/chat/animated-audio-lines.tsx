'use client';

import { motion } from 'framer-motion';

export function AnimatedAudioLines() {
  const bars = [
    { scaleY: [0.2, 0.3, 0.2, 0.3, 0.2], duration: 1.2 }, // 0
    { scaleY: [0.3, 0.4, 0.2, 0.4, 0.3], duration: 1.4 }, // 1
    { scaleY: [0.4, 0.2, 0.5, 0.3, 0.4], duration: 1.1 }, // 2
    { scaleY: [0.5, 0.6, 0.3, 0.5, 0.5], duration: 1.5 }, // 3
    { scaleY: [0.3, 0.7, 0.4, 0.6, 0.3], duration: 1.3 }, // 4
    { scaleY: [0.6, 0.4, 0.8, 0.5, 0.6], duration: 1.6 }, // 5
    { scaleY: [0.4, 0.9, 0.6, 0.8, 0.4], duration: 1.2 }, // 6
    { scaleY: [1.0, 0.5, 0.9, 0.6, 1.0], duration: 1.4 }, // 7 (Center)
    { scaleY: [0.5, 0.8, 0.4, 0.9, 0.5], duration: 1.5 }, // 8
    { scaleY: [0.7, 0.4, 0.8, 0.5, 0.7], duration: 1.3 }, // 9
    { scaleY: [0.4, 0.6, 0.3, 0.7, 0.4], duration: 1.1 }, // 10
    { scaleY: [0.6, 0.3, 0.6, 0.4, 0.6], duration: 1.5 }, // 11
    { scaleY: [0.3, 0.5, 0.2, 0.4, 0.3], duration: 1.2 }, // 12
    { scaleY: [0.4, 0.2, 0.4, 0.3, 0.4], duration: 1.4 }, // 13
    { scaleY: [0.2, 0.3, 0.2, 0.3, 0.2], duration: 1.3 }, // 14
  ];

  return (
    <div className="flex w-full items-center justify-center p-8">
      <motion.svg
        width="160"
        height="160"
        viewBox="0 0 100 100"
        className="text-foreground"
      >
        {bars.map((bar, i) => (
          <motion.rect
            key={i}
            x={6 + i * 6}
            y={20}
            width={4}
            height={60}
            rx={2}
            fill="currentColor"
            style={{ originY: '50px' }}
            animate={{ scaleY: bar.scaleY }}
            transition={{
              duration: bar.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.svg>
    </div>
  );
}
