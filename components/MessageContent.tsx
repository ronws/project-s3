'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check } from 'lucide-react';
import { showToast } from './Toast';
import 'highlight.js/styles/github-dark.css';

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

export function MessageContent({ content, isUser }: MessageContentProps) {
  if (isUser) {
    return <p className="break-words whitespace-pre-wrap text-sm">{content}</p>;
  }

  return (
    <div className="text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-zinc-800 dark:text-zinc-200">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mt-4 mb-2 text-zinc-800 dark:text-zinc-200">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mt-3 mb-2 text-zinc-800 dark:text-zinc-200">{children}</h3>,
          p: ({ children }) => <p className="my-2 text-zinc-700 dark:text-zinc-300">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1 text-zinc-700 dark:text-zinc-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1 text-zinc-700 dark:text-zinc-300">{children}</ol>,
          li: ({ children }) => <li className="text-zinc-700 dark:text-zinc-300">{children}</li>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return <code className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-xs font-mono">{children}</code>;
            }
            return (
              <CodeBlockWithCopy code={String(children).replace(/\n$/, '')} language={className?.replace('language-', '') || 'code'} />
            );
          },
          pre: ({ children }) => <>{children}</>,
          a: ({ href, children }) => <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
          hr: () => <hr className="my-4 border-zinc-300 dark:border-zinc-700" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-zinc-300 dark:border-zinc-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-zinc-100 dark:bg-zinc-800">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-zinc-300 dark:border-zinc-700">{children}</tr>,
          th: ({ children }) => <th className="px-3 py-2 text-left text-zinc-700 dark:text-zinc-300 font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{children}</td>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-zinc-400 pl-4 my-2 italic text-zinc-600 dark:text-zinc-400">{children}</blockquote>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlockWithCopy({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const codeTrimmed = code.trimEnd().replace(/\n+$/, '');
  const lines = codeTrimmed.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeTrimmed);
    setCopied(true);
    showToast('Code copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700">
        <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium uppercase">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
          )}
        </button>
      </div>
      <div className="flex bg-zinc-100 dark:bg-zinc-900 overflow-x-auto">
        <div className="flex-shrink-0 py-3 pl-3 pr-2 text-right select-none border-r border-zinc-300 dark:border-zinc-700">
          {lines.map((_, idx) => (
            <div key={idx} className="text-xs text-zinc-400 font-mono leading-5">
              {idx + 1}
            </div>
          ))}
        </div>
        <pre className="flex-1 p-3 text-xs font-mono overflow-x-auto">
          <code className={`language-${language}`}>{codeTrimmed}</code>
        </pre>
      </div>
    </div>
  );
}