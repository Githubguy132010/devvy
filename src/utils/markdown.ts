import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return React.createElement(ReactMarkdown, {
    remarkPlugins: [remarkGfm],
    components: {
      p: ({ children }: any) => React.createElement('p', { className: 'markdown-p' }, children),
      h1: ({ children }: any) => React.createElement('h1', { className: 'markdown-h1' }, children),
      h2: ({ children }: any) => React.createElement('h2', { className: 'markdown-h2' }, children),
      h3: ({ children }: any) => React.createElement('h3', { className: 'markdown-h3' }, children),
      h4: ({ children }: any) => React.createElement('h4', { className: 'markdown-h4' }, children),
      ul: ({ children }: any) => React.createElement('ul', { className: 'markdown-ul' }, children),
      ol: ({ children }: any) => React.createElement('ol', { className: 'markdown-ol' }, children),
      li: ({ children }: any) => React.createElement('li', { className: 'markdown-li' }, children),
      a: ({ children, href }: any) => React.createElement('a', {
        href: href,
        className: 'markdown-a',
        target: '_blank',
        rel: 'noopener noreferrer',
      }, children),
      blockquote: ({ children }: any) => React.createElement('blockquote', { className: 'markdown-blockquote' }, children),
      hr: () => React.createElement('hr', { className: 'markdown-hr' }),
      table: ({ children }: any) => React.createElement('table', { className: 'markdown-table' }, children),
      thead: ({ children }: any) => React.createElement('thead', { className: 'markdown-thead' }, children),
      tbody: ({ children }: any) => React.createElement('tbody', { className: 'markdown-tbody' }, children),
      tr: ({ children }: any) => React.createElement('tr', { className: 'markdown-tr' }, children),
      th: ({ children }: any) => React.createElement('th', { className: 'markdown-th' }, children),
      td: ({ children }: any) => React.createElement('td', { className: 'markdown-td' }, children),
      strong: ({ children }: any) => React.createElement('strong', { className: 'markdown-strong' }, children),
      em: ({ children }: any) => React.createElement('em', { className: 'markdown-em' }, children),
      code: CodeBlock,
    },
  }, content);
}

function CodeBlock({ children, className, ...props }: any) {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  if (!match) {
    return React.createElement('code', { className: className, ...props }, children);
  }

  return React.createElement('div', { className: 'code-block-wrapper' },
    React.createElement('div', { className: 'code-block-header' },
      React.createElement('span', { className: 'code-language' }, language)
    ),
    React.createElement(SyntaxHighlighter, {
      style: vscDarkPlus,
      language: language,
      PreTag: 'div',
      className: 'code-block-content',
      ...props,
    }, code)
  );
}

export function isMarkdown(content: string): boolean {
  const patterns = [
    /^#{1,6}\s+/m,
    /\*\*.*?\*\*/,
    /`[^`]+`/,
    /```[\s\S]*?```/,
    /^\s*[-*+]\s+/m,
    /^\s*\d+\.\s+/m,
    /\[.*?\]\(.*?\)/,
  ];

  return patterns.some((pattern: RegExp) => pattern.test(content));
}

export function extractCodeBlocks(content: string): Array<{ language: string; code: string }> {
  const codeBlocks: Array<{ language: string; code: string }> = [];
  const lines = content.split('\n');
  let currentBlock: { language: string; code: string } | null = null;
  let inCodeBlock = false;
  const codeLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCodeBlock && currentBlock) {
        currentBlock.code = codeLines.join('\n');
        codeBlocks.push(currentBlock);
        codeLines.length = 0;
      } else {
        const lang = line.substring(3).trim() || 'text';
        currentBlock = { language: lang, code: '' };
      }
      inCodeBlock = !inCodeBlock;
    } else if (inCodeBlock && currentBlock) {
      codeLines.push(line);
    }
  }

  return codeBlocks;
}
