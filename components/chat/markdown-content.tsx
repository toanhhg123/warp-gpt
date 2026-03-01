import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

type MarkdownContentProps = {
  className?: string;
  content: string;
};

export function MarkdownContent({ className, content }: MarkdownContentProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => <h1 className="text-lg font-semibold tracking-tight" {...props} />,
          h2: ({ ...props }) => <h2 className="text-base font-semibold tracking-tight" {...props} />,
          h3: ({ ...props }) => <h3 className="text-sm font-semibold tracking-tight" {...props} />,
          p: ({ ...props }) => <p className="leading-relaxed" {...props} />,
          ul: ({ ...props }) => <ul className="list-disc space-y-1 pl-5" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal space-y-1 pl-5" {...props} />,
          li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-2 border-border pl-3 italic text-muted-foreground" {...props} />
          ),
          a: ({ ...props }) => (
            <a
              className="text-primary underline underline-offset-4 hover:text-primary/80"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <code className={cn('block overflow-x-auto rounded-xl bg-muted px-3 py-2 text-xs', className)} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-muted px-1 py-0.5 text-[12px]" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ ...props }) => <pre className="overflow-x-auto" {...props} />,
          table: ({ ...props }) => <table className="w-full border-collapse text-xs" {...props} />,
          thead: ({ ...props }) => <thead className="bg-muted/70" {...props} />,
          th: ({ ...props }) => <th className="border border-border px-2 py-1 text-left font-medium" {...props} />,
          td: ({ ...props }) => <td className="border border-border px-2 py-1 align-top" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
