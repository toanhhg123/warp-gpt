'use client';

import * as React from 'react';

import { conversations, starterMessages } from './constants';
import { ChatComposer } from './chat-composer';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatSidebar } from './chat-sidebar';
import { usePrefersReducedMotion } from './hooks/use-prefers-reduced-motion';
import { useTTS } from './hooks/use-tts';
import { useVoiceRecorder } from './hooks/use-voice-recorder';
import type { ChatMessage } from './types';

export function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [text, setText] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { speak, stop: stopSpeaking, isSpeaking, unlock } = useTTS();

  const {
    audioBlob,
    audioUrl,
    clearAudio,
    formattedDuration,
    isRecording,
    isSpeechSupported,
    isTalking,
    recordingError,
    toggleRecording,
    voiceText,
    recordingMode,
  } = useVoiceRecorder({
    onStopTalking: (capturedText?: string) => {
      if (isRecording) {
        sendMessage(capturedText || voiceText);
      }
    },
    onStopRecording: (mode: 'audio' | 'voice', capturedText: string) => {
      if (mode === 'audio' && capturedText) {
        setText((prev) => (prev ? `${prev} ${capturedText}` : capturedText).trim());
        clearAudio();
      }
    },
  });

  const messageAudioUrlsRef = React.useRef<string[]>([]);

  const revokeMessageAudioUrls = React.useCallback(() => {
    for (const url of messageAudioUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    messageAudioUrlsRef.current = [];
  }, []);

  const sendMessage = React.useCallback(
    async (overrideText?: string) => {
      // Unlock speech synthesis on mobile (iOS/Android require a gesture-triggered call)
      // Must happen synchronously before any `await` to stay within the gesture event stack
      unlock();

      if (isLoading) {
        return;
      }

      const value = typeof overrideText === 'string' ? overrideText.trim() : text.trim();
      if (!value && !audioUrl) {
        return;
      }
      const prompt = value || 'I sent a voice message. Please help me from this context.';

      const now = new Date();
      const userTime = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const messageAudioUrl = audioBlob ? URL.createObjectURL(audioBlob) : undefined;
      if (messageAudioUrl) {
        messageAudioUrlsRef.current.push(messageAudioUrl);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${prev.length + 1}`,
          role: 'user',
          text: value || 'Voice message',
          time: userTime,
          audioUrl: messageAudioUrl,
        },
      ]);

      setIsLoading(true);

      setText('');
      clearAudio();

      const history = messages
        .filter((item) => item.text.trim().length > 0)
        .map((item) => ({
          role: item.role,
          text: item.text,
        }));

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            history,
            message: prompt,
          }),
        });

        const payload = (await response.json()) as { error?: string; reply?: string };

        if (!response.ok) {
          throw new Error(payload.error || 'Gemini API returned an error.');
        }

        const assistantTime = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        const replyText = payload.reply?.trim();
        if (!replyText) {
          throw new Error('Empty response from Gemini.');
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `m-${prev.length + 1}`,
            role: 'assistant',
            text: replyText,
            time: assistantTime,
          },
        ]);

        // Auto-play the AI response via TTS
        speak(replyText);
      } catch {
        const assistantTime = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        const errorMessage = 'Something went wrong. Try again later.';

        setMessages((prev) => [
          ...prev,
          {
            id: `m-${prev.length + 1}`,
            role: 'assistant',
            text: errorMessage,
            time: assistantTime,
          },
        ]);

        // Speak the error message too
        speak(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [audioBlob, audioUrl, clearAudio, isLoading, messages, speak, text, unlock],
  );

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'end',
    });
  }, [messages, prefersReducedMotion]);

  React.useEffect(() => {
    return revokeMessageAudioUrls;
  }, [revokeMessageAudioUrls]);

  return (
    <div className="from-muted via-background to-muted/30 text-foreground min-h-screen bg-linear-to-b p-2 sm:p-4">
      <div className="mx-auto flex h-[calc(100dvh-1rem)] w-full max-w-400 overflow-hidden rounded-2xl sm:rounded-3xl border bg-background shadow-2xl sm:h-[calc(100dvh-2rem)]">
        {/* <ChatSidebar
          conversations={conversations}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        /> */}

        <main className="flex min-w-0 flex-1 flex-col">
          <ChatHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
          <ChatMessages
            isLoading={isLoading}
            messages={messages}
            messagesEndRef={messagesEndRef}
          />
          <ChatComposer
            audioUrl={audioUrl}
            formattedDuration={formattedDuration}
            isLoading={isLoading}
            isRecording={isRecording}
            isSpeechSupported={isSpeechSupported}
            isSpeaking={isSpeaking}
            isTalking={isTalking}
            onSend={sendMessage}
            onStopSpeaking={stopSpeaking}
            onTextChange={setText}
            onToggleRecording={toggleRecording}
            recordingError={recordingError}
            text={text}
            voiceText={voiceText}
            recordingMode={recordingMode}
          />
        </main>
      </div>
    </div>
  );
}
