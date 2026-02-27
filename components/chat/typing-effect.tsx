import * as React from 'react';
import { motion } from 'framer-motion';

type TypingEffectProps = {
  text: string;
  speed?: number; // milliseconds per character
  delay?: number; // initial delay before typing starts
  onComplete?: () => void;
};

export function TypingEffect({ text, speed = 40, delay = 0, onComplete }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = React.useState('');

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    // Reset state if text changes
    setDisplayedText('');

    const typeChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        timeoutId = setTimeout(typeChar, speed);
      } else if (onComplete) {
        onComplete();
      }
    };

    // Start typing after initial delay
    timeoutId = setTimeout(typeChar, delay);

    return () => clearTimeout(timeoutId);
  }, [text, speed, delay, onComplete]);

  return <span>{displayedText}</span>;
}
