import * as React from "react";
import { BotIcon, UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "./types";

type ChatMessagesProps = {
  messages: ChatMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export function ChatMessages({ messages, messagesEndRef }: ChatMessagesProps) {
  return (
    <section className="flex w-full flex-1 flex-col overflow-y-auto px-3 py-6 scroll-smooth sm:px-4">
      <div className="space-y-5">
        {messages.map((message, index) => (
          <article
            key={message.id}
            className={cn(
              "animate-in fade-in slide-in-from-bottom-3 duration-300 flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start",
            )}
            style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
          >
            {message.role === "assistant" ? (
              <div className="bg-primary text-primary-foreground mt-1 flex size-7 shrink-0 items-center justify-center border">
                <BotIcon className="size-3.5" />
              </div>
            ) : null}

            <div
              className={cn(
                "max-w-[85%] border px-3 py-2 text-sm leading-relaxed sm:max-w-[80%]",
                message.role === "assistant"
                  ? "bg-card border-border"
                  : "bg-primary text-primary-foreground border-primary",
              )}
            >
              <p>{message.text}</p>
              {message.audioUrl ? (
                <audio
                  className="mt-3 w-full min-w-55"
                  controls
                  preload="metadata"
                  src={message.audioUrl}
                />
              ) : null}
              <p
                className={cn(
                  "mt-2 text-[11px]",
                  message.role === "assistant"
                    ? "text-muted-foreground"
                    : "text-primary-foreground/75",
                )}
              >
                {message.time}
              </p>
            </div>

            {message.role === "user" ? (
              <div className="bg-muted mt-1 flex size-7 shrink-0 items-center justify-center border">
                <UserIcon className="size-3.5" />
              </div>
            ) : null}
          </article>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </section>
  );
}
