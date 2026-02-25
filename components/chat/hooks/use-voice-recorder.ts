"use client";

import * as React from "react";

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

type UseVoiceRecorderParams = {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
};

function getSpeechRecognitionCtor(): SpeechRecognitionCtorLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  const windowWithSpeech = window as WindowWithSpeechRecognition;
  return (
    windowWithSpeech.SpeechRecognition ??
    windowWithSpeech.webkitSpeechRecognition ??
    null
  );
}

export function useVoiceRecorder({ text, setText }: UseVoiceRecorderParams) {
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [recordingError, setRecordingError] = React.useState<string | null>(
    null,
  );
  const [isSpeechSupported, setIsSpeechSupported] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingSeconds, setRecordingSeconds] = React.useState(0);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<number | null>(null);
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);
  const inputBeforeVoiceRef = React.useRef("");
  const finalTranscriptRef = React.useRef("");

  const clearAudio = React.useCallback(() => {
    setAudioBlob(null);
    setAudioUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return null;
    });
  }, []);

  React.useEffect(() => {
    setIsSpeechSupported(Boolean(getSpeechRecognitionCtor()));
  }, []);

  const stopVoiceRecognition = React.useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  const startVoiceRecognition = React.useCallback(() => {
    const RecognitionCtor = getSpeechRecognitionCtor();
    if (!RecognitionCtor) {
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "vi-VN";

    inputBeforeVoiceRef.current = text.trim();
    finalTranscriptRef.current = "";

    recognition.onresult = (event) => {
      let interim = "";
      let finalPart = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim() ?? "";

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
        finalTranscriptRef.current =
          `${finalTranscriptRef.current} ${finalPart}`
            .replace(/\s+/g, " ")
            .trim();
      }

      const combinedText = [
        inputBeforeVoiceRef.current,
        finalTranscriptRef.current,
        interim.trim(),
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      setText(combinedText);
    };

    recognition.onerror = (event) => {
      setRecordingError(`Voice input error: ${event.error}`);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [setText, text]);

  const stopRecording = React.useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    stopVoiceRecognition();

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
  }, [stopVoiceRecognition]);

  const startRecording = React.useCallback(async () => {
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
        const nextAudioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (nextAudioBlob.size > 0) {
          setAudioBlob(nextAudioBlob);
          const nextUrl = URL.createObjectURL(nextAudioBlob);
          setAudioUrl((currentUrl) => {
            if (currentUrl) {
              URL.revokeObjectURL(currentUrl);
            }
            return nextUrl;
          });
        }

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
      };

      recorder.start();
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((value) => value + 1);
      }, 1000);

      startVoiceRecognition();
    } catch {
      setRecordingError(
        "Không thể truy cập microphone. Hãy kiểm tra quyền trên trình duyệt.",
      );
      setIsRecording(false);
    }
  }, [clearAudio, startVoiceRecognition]);

  const toggleRecording = React.useCallback(() => {
    if (isRecording) {
      stopRecording();
      return;
    }
    void startRecording();
  }, [isRecording, startRecording, stopRecording]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
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
      .padStart(2, "0");
    const seconds = (recordingSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [recordingSeconds]);

  return {
    audioBlob,
    audioUrl,
    clearAudio,
    formattedDuration,
    isRecording,
    isSpeechSupported,
    recordingError,
    toggleRecording,
  };
}
