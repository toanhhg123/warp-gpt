'use client';

import * as React from 'react';

import { conversations, starterMessages } from './constants';
import { ChatComposer } from './chat-composer';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatSidebar } from './chat-sidebar';
import { usePrefersReducedMotion } from './hooks/use-prefers-reduced-motion';
import { useVoiceRecorder } from './hooks/use-voice-recorder';
import { VoiceModeOverlay } from './voice-mode-overlay';
import type { ChatMessage } from './types';

export function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [text, setText] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>(starterMessages);
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const {
    audioBlob,
    audioUrl,
    clearAudio,
    formattedDuration,
    isRecording,
    isSpeechSupported,
    recordingError,
    toggleRecording,
    voiceText,
  } = useVoiceRecorder();

  const messageAudioUrlsRef = React.useRef<string[]>([]);

  const revokeMessageAudioUrls = React.useCallback(() => {
    for (const url of messageAudioUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    messageAudioUrlsRef.current = [];
  }, []);

  const sendMessage = React.useCallback(
    async (overrideText?: string) => {
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

      if (typeof overrideText !== 'string') {
        setText('');
      }
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
      } catch (error) {
        const assistantTime = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        const errorMessage =
          error instanceof Error ? error.message : 'Unexpected error while calling Gemini API.';

        setMessages((prev) => [
          ...prev,
          {
            id: `m-${prev.length + 1}`,
            role: 'assistant',
            text: `Lỗi khi gọi Gemini: ${errorMessage}`,
            time: assistantTime,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [audioBlob, audioUrl, clearAudio, isLoading, messages, text],
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
      <VoiceModeOverlay
        duration={formattedDuration}
        isVisible={isRecording}
        onStop={() => {
          toggleRecording();
          sendMessage(voiceText);
        }}
        onClose={toggleRecording}
        reducedMotion={prefersReducedMotion}
        text={voiceText}
      />

      <div className="mx-auto flex h-[calc(100dvh-1rem)] w-full max-w-400 overflow-hidden rounded-2xl sm:rounded-3xl border bg-background shadow-2xl sm:h-[calc(100dvh-2rem)]">
        <ChatSidebar
          conversations={conversations}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

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
            onSend={sendMessage}
            onTextChange={setText}
            onToggleRecording={toggleRecording}
            recordingError={recordingError}
            text={text}
          />
        </main>
      </div>
    </div>
  );
}
