'use client';

import * as React from 'react';

// Mobile browsers load voices asynchronously. This helper waits for them.
function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    // Voices not ready yet — wait for the event (fires once on mobile)
    const handler = () => {
      resolve(window.speechSynthesis.getVoices());
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    // Safety timeout — resolve with empty list if event never fires
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices());
    }, 2000);
  });
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const unlockedRef = React.useRef(false);
  // iOS fix: keep a resume interval so long utterances don't get paused
  const resumeIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const clearResumeInterval = React.useCallback(() => {
    if (resumeIntervalRef.current !== null) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
  }, []);

  /**
   * iOS Safari blocks speechSynthesis unless triggered by a user gesture.
   * Call `unlock()` once inside any gesture handler (e.g., the send button onClick)
   * and all subsequent programmatic `speak()` calls will work for the whole session.
   */
  const unlock = React.useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis || unlockedRef.current) return;
    const silent = new SpeechSynthesisUtterance('');
    silent.volume = 0;
    window.speechSynthesis.speak(silent);
    // Cancel immediately — this is enough to unlock the API
    setTimeout(() => window.speechSynthesis.cancel(), 0);
    unlockedRef.current = true;
  }, []);

  const speak = React.useCallback(
    async (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      clearResumeInterval();

      // SAFETY FALLBACK: If the speech never starts (e.g. mobile browser blocked it silently),
      // we must reset isSpeaking so the UI doesn't get stuck in "talking" mode forever.
      const fallbackTimeout = setTimeout(() => {
        setIsSpeaking(false);
        clearResumeInterval();
      }, 3000);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Wait for voices to be available (critical on mobile)
      const voices = await getVoicesAsync();
      const preferred = voices.find(
        (v) =>
          v.lang === 'en-US' &&
          (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')),
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onstart = () => {
        clearTimeout(fallbackTimeout);
        setIsSpeaking(true);
        // iOS bug workaround: keep calling resume() so the utterance isn't paused mid-speech
        resumeIntervalRef.current = setInterval(() => {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }, 250);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        clearResumeInterval();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        clearResumeInterval();
      };

      window.speechSynthesis.speak(utterance);
    },
    [clearResumeInterval],
  );

  const stop = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    clearResumeInterval();
  }, [clearResumeInterval]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
      clearResumeInterval();
    };
  }, [clearResumeInterval]);

  return { speak, stop, isSpeaking, unlock };
}
