import React from 'react';
import { CASE_STUDIES } from '../data';
import { BookOpen, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  caseStudy: 'Contoso' | 'Litware';
  isOpen: boolean;
  onClose: () => void;
}

const CaseStudyPanel: React.FC<Props> = ({ caseStudy, isOpen, onClose }) => {
  if (!isOpen) return null;

  const content = CASE_STUDIES[caseStudy];

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] md:w-[600px] max-w-full bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 z-50 overflow-y-auto flex flex-col">
      <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-fabric-900">
          <BookOpen size={20} />
          <h2 className="font-bold text-lg">Case Study: {caseStudy}</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 md:p-8 overflow-y-auto flex-1">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-fabric-900 mb-6 border-b-2 border-fabric-100 pb-2" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4 flex items-center gap-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-600" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-gray-600" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            p: ({node, ...props}) => <p className="mb-4 text-gray-600 leading-relaxed" {...props} />,
            table: ({node, ...props}) => <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200 shadow-sm"><table className="min-w-full divide-y divide-gray-200" {...props} /></div>,
            thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
            tbody: ({node, ...props}) => <tbody className="bg-white divide-y divide-gray-200" {...props} />,
            tr: ({node, ...props}) => <tr className="hover:bg-gray-50" {...props} />,
            th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" {...props} />,
            td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap" {...props} />,
            strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
            code: ({node, ...props}) => <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default CaseStudyPanel;