import * as React from 'react';
import { BotIcon, UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { TypingEffect } from './typing-effect';
import type { ChatMessage } from './types';

type ChatMessagesProps = {
  messages: ChatMessage[];
  isLoading?: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export function ChatMessages({ messages, isLoading, messagesEndRef }: ChatMessagesProps) {
  return (
    <section className="flex w-full flex-1 flex-col overflow-y-auto px-3 py-6 scroll-smooth sm:px-4">
      <div className="space-y-5">
        {messages.map((message, index) => {
          const isLatestAssistantMessage =
            index === messages.length - 1 && message.role === 'assistant';

          return (
            <article
              key={message.id}
              className={cn(
                'animate-in fade-in slide-in-from-bottom-3 duration-300 flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start',
              )}
              style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
            >
              {message.role === 'assistant' ? (
                <motion.div
                  layoutId={isLatestAssistantMessage ? 'bot-avatar' : undefined}
                  className="bg-primary text-primary-foreground mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border"
                >
                  <BotIcon className="size-3.5" />
                </motion.div>
              ) : null}

              <div
                className={cn(
                  'max-w-[85%] rounded-2xl border px-4 py-2 text-sm leading-relaxed sm:max-w-[80%]',
                  message.role === 'assistant'
                    ? 'bg-card border-border flex flex-col gap-2'
                    : 'bg-primary text-primary-foreground border-primary',
                )}
              >
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Assistant generated image"
                    className="w-full h-auto max-w-sm rounded-xl border border-border mt-1"
                  />
                )}
                <p>
                  {isLatestAssistantMessage ? (
                    <TypingEffect
                      text={message.text}
                      speed={15}
                      delay={100}
                    />
                  ) : (
                    message.text
                  )}
                </p>
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
                    'mt-2 text-[11px]',
                    message.role === 'assistant'
                      ? 'text-muted-foreground'
                      : 'text-primary-foreground/75',
                  )}
                >
                  {message.time}
                </p>
              </div>

              {message.role === 'user' ? (
                <div className="bg-muted mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border">
                  <UserIcon className="size-3.5" />
                </div>
              ) : null}
            </article>
          );
        })}
        {isLoading && (
          <article className="animate-in fade-in slide-in-from-bottom-3 duration-300 flex gap-3 justify-start">
            <div className="bg-primary text-primary-foreground mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border">
              <BotIcon className="size-3.5" />
            </div>
            <div className="bg-card border-border flex flex-col gap-2 rounded-2xl border px-4 py-4 text-sm leading-relaxed sm:max-w-[80%] h-11 justify-center">
              <div className="flex items-center gap-1">
                <span className="animate-bounce bg-foreground/50 size-1.5 rounded-full [animation-delay:-0.3s]" />
                <span className="animate-bounce bg-foreground/50 size-1.5 rounded-full [animation-delay:-0.15s]" />
                <span className="animate-bounce bg-foreground/50 size-1.5 rounded-full" />
              </div>
            </div>
          </article>
        )}
        <div ref={messagesEndRef} />
      </div>
    </section>
  );
}
