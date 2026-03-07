'use client';

import * as React from 'react';

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtorLike = new () => SpeechRecognitionLike;

type WindowWithSpeechRecognition = Window & {
  webkitSpeechRecognition?: SpeechRecognitionCtorLike;
  SpeechRecognition?: SpeechRecognitionCtorLike;
};

function getSpeechRecognitionCtor(): SpeechRecognitionCtorLike | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const windowWithSpeech = window as WindowWithSpeechRecognition;
  return windowWithSpeech.SpeechRecognition ?? windowWithSpeech.webkitSpeechRecognition ?? null;
}

export function useVoiceRecorder({
  onStopTalking,
  onStopRecording,
}: {
  onStopTalking?: (text?: string) => void;
  onStopRecording?: (mode: 'audio' | 'voice', text: string) => void;
} = {}) {
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [voiceText, setVoiceText] = React.useState('');
  const [recordingError, setRecordingError] = React.useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingMode, setRecordingMode] = React.useState<'audio' | 'voice' | null>(null);
  const [recordingSeconds, setRecordingSeconds] = React.useState(0);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<number | null>(null);
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = React.useRef('');

  const [isTalking, setIsTalking] = React.useState(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const silenceTimeoutRef = React.useRef<number | null>(null);
  const visualTimeoutRef = React.useRef<number | null>(null);

  const onStopTalkingRef = React.useRef(onStopTalking);
  React.useEffect(() => {
    onStopTalkingRef.current = onStopTalking;
  }, [onStopTalking]);

  const onStopRecordingRef = React.useRef(onStopRecording);
  React.useEffect(() => {
    onStopRecordingRef.current = onStopRecording;
  }, [onStopRecording]);

  const voiceTextRef = React.useRef(voiceText);
  React.useEffect(() => {
    voiceTextRef.current = voiceText;
  }, [voiceText]);

  const clearAudio = React.useCallback(() => {
    setVoiceText('');
    setAudioBlob(null);
    setAudioUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return null;
    });
    finalTranscriptRef.current = '';

    // Clear the SpeechRecognition buffer by stopping it.
    // The useEffect hook will automatically restart it if we are still recording.
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null; // Prevent final results from updating state
      recognitionRef.current.stop();
    }
  }, []);

  React.useEffect(() => {
    setIsSpeechSupported(Boolean(getSpeechRecognitionCtor()));
  }, []);

  const stopVoiceRecognition = React.useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  const startVoiceRecognitionRef = React.useRef<((e?: unknown) => void) | null>(null);

  const startVoiceRecognition = React.useCallback(() => {
    const RecognitionCtor = getSpeechRecognitionCtor();
    if (!RecognitionCtor) {
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    finalTranscriptRef.current = '';

    recognition.onresult = (event) => {
      let interim = '';
      let finalPart = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim() ?? '';

        if (!transcript) {
          continue;
        }

        if (result.isFinal) {
          finalPart += `${transcript} `;
        } else {
          interim += `${transcript} `;
        }
      }

      if (finalPart) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalPart}`
          .replace(/\s+/g, ' ')
          .trim();
      }

      const combinedText = [finalTranscriptRef.current, interim.trim()]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      setVoiceText(combinedText);
    };

    recognition.onerror = (event) => {
      setRecordingError(`Voice input error: ${event.error}`);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      // Automatically restart if we are still supposed to be recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          if (startVoiceRecognitionRef.current) {
            startVoiceRecognitionRef.current();
          }
        } catch (e) {
          console.error('Lỗi khởi động lại nhận diện giọng nói:', e);
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, []);

  React.useEffect(() => {
    startVoiceRecognitionRef.current = startVoiceRecognition;
  }, [startVoiceRecognition]);

  const stopRecording = React.useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (visualTimeoutRef.current) {
      window.clearTimeout(visualTimeoutRef.current);
      visualTimeoutRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsTalking(false);

    setIsRecording(false);
    setRecordingMode(null);
    stopVoiceRecognition();

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      return;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
  }, [stopVoiceRecognition]);

  const startRecording = React.useCallback(
    async (mode: 'audio' | 'voice') => {
      try {
        setRecordingError(null);
        setRecordingSeconds(0);
        clearAudio();

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        audioChunksRef.current = [];

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          mediaRecorderRef.current = null;

          if (onStopRecordingRef.current) {
            onStopRecordingRef.current(mode, voiceTextRef.current);
          }
        };

        recorder.start();
        setIsRecording(true);
        setRecordingMode(mode);

        // Always start the timer immediately it starts recording reliably giving visual feedback
        timerRef.current = window.setInterval(() => {
          setRecordingSeconds((value) => value + 1);
        }, 1000);

        try {
          const audioCtx = new (
            window.AudioContext ||
            (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!
          )();

          // AudioContext might be in a suspended state on some browsers until explicit user interaction
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }

          const analyser = audioCtx.createAnalyser();
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          analyser.fftSize = 256;

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const checkAudioLevel = () => {
            if (!analyserRef.current) return;

            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            // Lowered the threshold slightly for mobile microphones
            const currentlyTalking = average > 15;

            if (currentlyTalking) {
              setIsTalking(true);
              if (silenceTimeoutRef.current !== null) {
                window.clearTimeout(silenceTimeoutRef.current);
                silenceTimeoutRef.current = null;
              }
              if (visualTimeoutRef.current !== null) {
                window.clearTimeout(visualTimeoutRef.current);
                visualTimeoutRef.current = null;
              }
            } else {
              if (visualTimeoutRef.current === null) {
                visualTimeoutRef.current = window.setTimeout(() => {
                  visualTimeoutRef.current = null;
                  setIsTalking(false);
                }, 1000);
              }
              if (silenceTimeoutRef.current === null && mode === 'voice') {
                silenceTimeoutRef.current = window.setTimeout(() => {
                  silenceTimeoutRef.current = null;
                  if (voiceTextRef.current.trim() !== '') {
                    if (onStopTalkingRef.current) {
                      const currentText = voiceTextRef.current;
                      voiceTextRef.current = '';
                      setVoiceText(''); // Clear immediately so next tick doesn't resend
                      finalTranscriptRef.current = '';
                      if (recognitionRef.current) {
                        recognitionRef.current.onresult = null; // Prevent final async results from flashing
                        recognitionRef.current.stop();
                      }

                      onStopTalkingRef.current(currentText);
                    }
                  }
                }, 1500); // Increased silence timeout slightly to prevent premature cutting off
              }
            }

            animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
          };

          checkAudioLevel();
        } catch (audioCtxError) {
          console.warn(
            'AudioContext initialization failed, falling back to basic recording:',
            audioCtxError,
          );
          // We still continue without visual audio levels if AudioContext fails
        }

        try {
          startVoiceRecognition();
        } catch (speechErr) {
          console.warn('Speech recognition failed to start:', speechErr);
        }
      } catch {
        setRecordingError('Không thể truy cập microphone. Hãy kiểm tra quyền trên trình duyệt.');
        setIsRecording(false);
      }
    },
    [clearAudio, startVoiceRecognition],
  );

  const toggleRecording = React.useCallback(
    (mode: 'audio' | 'voice' = 'audio') => {
      if (isRecording) {
        stopRecording();
        return;
      }
      void startRecording(mode);
    },
    [isRecording, startRecording, stopRecording],
  );

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }

      if (silenceTimeoutRef.current) {
        window.clearTimeout(silenceTimeoutRef.current);
      }
      if (visualTimeoutRef.current) {
        window.clearTimeout(visualTimeoutRef.current);
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.stop();

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const formattedDuration = React.useMemo(() => {
    const minutes = Math.floor(recordingSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (recordingSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [recordingSeconds]);

  return {
    audioBlob,
    audioUrl,
    clearAudio,
    formattedDuration,
    isRecording,
    isSpeechSupported,
    isTalking,
    recordingError,
    recordingMode,
    toggleRecording,
    voiceText,
  };
}
