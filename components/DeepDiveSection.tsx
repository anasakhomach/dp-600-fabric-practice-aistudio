import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpenCheck, ChevronDown } from 'lucide-react';

interface Props {
  content: string;
}

const DeepDiveSection: React.FC<Props> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-t border-slate-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2 text-fabric-600 font-semibold">
          <BookOpenCheck size={20} />
          <span>📚 Deep Dive - Full Learning Material</span>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="prose prose-slate max-w-none bg-white rounded-xl p-6 border border-slate-200 shadow-inner">
            <ReactMarkdown
              components={{
                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3 first:mt-0" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-slate-700 mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed mb-3" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1 text-slate-600" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-slate-600" {...props} />,
                li: ({node, ...props}) => <li className="text-slate-600" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-slate-800" {...props} />,
                code: ({node, ...props}) => <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
                a: ({node, ...props}) => <a className="text-fabric-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-slate-300 text-sm" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
                th: ({node, ...props}) => <th className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700" {...props} />,
                td: ({node, ...props}) => <td className="border border-slate-300 px-3 py-2 text-slate-600" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-fabric-400 pl-4 italic text-slate-600 my-4" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeepDiveSection;
