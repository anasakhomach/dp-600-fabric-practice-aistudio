import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  text: string;
}

/**
 * Renders question text with proper markdown support for code blocks.
 * Detects ```language blocks and renders them with syntax styling.
 */
const QuestionText: React.FC<Props> = ({ text }) => {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown
        components={{
          // Main text styling
          p: ({node, ...props}) => (
            <p className="text-xl md:text-2xl font-medium text-slate-900 leading-relaxed mb-4" {...props} />
          ),
          // Bold text
          strong: ({node, ...props}) => (
            <strong className="font-bold text-slate-900" {...props} />
          ),
          // Code blocks (```dax, ```sql, ```python, etc.)
          pre: ({node, ...props}) => (
            <div className="my-6 rounded-xl overflow-x-auto border border-slate-200 shadow-sm max-w-full">
              <pre className="p-0 m-0 bg-transparent min-w-0" {...props} />
            </div>
          ),
          code: ({node, className, children, ...props}) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1].toUpperCase() : 'CODE';
            const isInline = !className;
            
            if (isInline) {
              // Inline code (single backticks)
              return (
                <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-base font-mono" {...props}>
                  {children}
                </code>
              );
            }
            
            // Block code (triple backticks)
            return (
              <div className="relative min-w-0">
                <div className="sticky top-0 left-0 right-0 bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700 z-10">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{language}</span>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                  </div>
                </div>
                <div className="bg-slate-900 pt-4 pb-4 px-4 overflow-x-auto">
                  <code className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre block min-w-max" {...props}>
                    {children}
                  </code>
                </div>
              </div>
            );
          },
          // Lists
          ul: ({node, ...props}) => (
            <ul className="list-disc pl-6 mb-4 space-y-1 text-lg text-slate-700" {...props} />
          ),
          li: ({node, ...props}) => (
            <li className="text-slate-700" {...props} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default QuestionText;
