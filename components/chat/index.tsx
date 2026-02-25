"use client";

import * as React from "react";

import { conversations, starterMessages } from "./constants";
import { ChatComposer } from "./chat-composer";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatSidebar } from "./chat-sidebar";
import { usePrefersReducedMotion } from "./hooks/use-prefers-reduced-motion";
import { useVoiceRecorder } from "./hooks/use-voice-recorder";
import { RecordingOverlay } from "./recording-overlay";
import type { ChatMessage } from "./types";

export function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [messages, setMessages] =
    React.useState<ChatMessage[]>(starterMessages);
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
  } = useVoiceRecorder({ setText, text });

  const messageAudioUrlsRef = React.useRef<string[]>([]);

  const revokeMessageAudioUrls = React.useCallback(() => {
    for (const url of messageAudioUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    messageAudioUrlsRef.current = [];
  }, []);

  const sendMessage = React.useCallback(() => {
    const value = text.trim();
    if (!value && !audioUrl) {
      return;
    }

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const messageAudioUrl = audioBlob
      ? URL.createObjectURL(audioBlob)
      : undefined;
    if (messageAudioUrl) {
      messageAudioUrlsRef.current.push(messageAudioUrl);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `m-${prev.length + 1}`,
        role: "user",
        text: value || "Voice message",
        time,
        audioUrl: messageAudioUrl,
      },
      {
        id: `m-${prev.length + 2}`,
        role: "assistant",
        text: messageAudioUrl
          ? "Mình đã nhận voice note của bạn. Nếu muốn, mình có thể tóm tắt hoặc chuyển thành checklist."
          : "Great prompt. I can wire this into API responses next, then add streaming and persisted chat history.",
        time,
      },
    ]);

    setText("");
    clearAudio();
  }, [audioBlob, audioUrl, clearAudio, text]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, prefersReducedMotion]);

  React.useEffect(() => {
    return revokeMessageAudioUrls;
  }, [revokeMessageAudioUrls]);

  return (
    <div className="from-muted via-background to-muted/30 text-foreground min-h-screen bg-linear-to-b p-2 sm:p-4">
      <RecordingOverlay
        duration={formattedDuration}
        isVisible={isRecording}
        onStop={toggleRecording}
        reducedMotion={prefersReducedMotion}
      />

      <div className="mx-auto flex h-[calc(100dvh-1rem)] w-full max-w-400 overflow-hidden border bg-background shadow-2xl sm:h-[calc(100dvh-2rem)]">
        <ChatSidebar
          conversations={conversations}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <ChatHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
          <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
          <ChatComposer
            audioUrl={audioUrl}
            formattedDuration={formattedDuration}
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
