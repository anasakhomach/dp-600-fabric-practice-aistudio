import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Question, UserProgress } from '../types';
import { CheckCircle2, XCircle, BookOpen, Check, ArrowRight, Lightbulb, Bookmark, Trophy, ListChecks } from 'lucide-react';

interface Props {
  question: Question;
  existingAnswer?: UserProgress;
  isBookmarked: boolean;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  onBookmarkToggle: () => void;
  onAnswer: (questionId: number, selectedIds: string[], isCorrect: boolean) => void;
  onShowCaseStudy: () => void;
  onNext?: () => void;
}

const QuestionCard: React.FC<Props> = ({ 
  question, 
  existingAnswer, 
  isBookmarked,
  questionIndex,
  totalQuestions,
  score,
  onBookmarkToggle,
  onAnswer, 
  onShowCaseStudy,
  onNext 
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    if (existingAnswer) {
      setSelectedIds(existingAnswer.selectedOptionIds);
      setIsSubmitted(true);
    } else {
      setSelectedIds([]);
      setIsSubmitted(false);
    }
  }, [question.id, existingAnswer]);

  const isMultiSelect = question.correctOptionIds.length > 1;

  // Calculate correctness dynamically
  const isCorrect = (() => {
    if (existingAnswer) return existingAnswer.isCorrect;
    if (!isSubmitted) return false;
    const correctSet = new Set(question.correctOptionIds);
    const selectedSet = new Set(selectedIds);
    return correctSet.size === selectedSet.size && 
           [...correctSet].every(id => selectedSet.has(id));
  })();

  const handleOptionClick = (optionId: string) => {
    if (isSubmitted) return;

    if (isMultiSelect) {
      setSelectedIds(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedIds([optionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;

    const correctSet = new Set(question.correctOptionIds);
    const selectedSet = new Set(selectedIds);
    const correct = correctSet.size === selectedSet.size && 
                    [...correctSet].every(id => selectedSet.has(id));

    setIsSubmitted(true);
    onAnswer(question.id, selectedIds, correct);
  };

  const getOptionStyle = (optionId: string) => {
    const isSelected = selectedIds.includes(optionId);
    const isOptionCorrect = question.correctOptionIds.includes(optionId);
    
    if (!isSubmitted) {
      return isSelected 
        ? "border-fabric-600 bg-fabric-50 ring-2 ring-fabric-200 shadow-md transform scale-[1.01]" 
        : "border-slate-200 hover:border-fabric-300 hover:bg-slate-50 hover:shadow-sm";
    }

    if (isOptionCorrect) {
      return "border-green-500 bg-green-50/50 ring-1 ring-green-200 shadow-sm";
    }
    
    if (isSelected && !isOptionCorrect) {
      return "border-red-300 bg-red-50/50 opacity-80";
    }

    return "border-slate-100 opacity-50 bg-slate-50";
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
      {/* Header Info */}
      <div className="flex flex-col-reverse lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider
            ${question.domain === 'Maintain' ? 'bg-orange-100 text-orange-700' : 
              question.domain === 'Prepare' ? 'bg-blue-100 text-blue-700' :
              question.domain === 'Model' ? 'bg-purple-100 text-purple-700' :
              'bg-teal-100 text-teal-700'
            }
          `}>
            {question.domain || "General"}
          </span>
          {question.caseStudyRef && (
            <button 
              onClick={onShowCaseStudy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
            >
              <BookOpen size={14} />
              {question.caseStudyRef} Case
            </button>
          )}
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
            {isMultiSelect ? "Multiple Choice" : "Single Choice"}
          </span>
        </div>
        
        <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
           {/* Compact Score/Progress Card */}
           <div className="flex items-center gap-3 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-sm h-9">
              <div className="flex items-center gap-1.5" title="Current Question / Total">
                <ListChecks size={16} className="text-slate-400" />
                <span className="font-bold text-slate-700 tabular-nums">{questionIndex + 1}<span className="text-slate-300 font-normal mx-0.5">/</span>{totalQuestions}</span>
              </div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="flex items-center gap-1.5" title="Current Score">
                <Trophy size={16} className="text-yellow-500" />
                <span className="font-bold text-fabric-600 tabular-nums">{score}</span>
              </div>
           </div>

           <button 
            onClick={onBookmarkToggle}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-200 border text-sm font-semibold shadow-sm h-9 ${
              isBookmarked 
                ? 'bg-yellow-50 border-yellow-200 text-yellow-600 shadow-yellow-100' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-yellow-600 hover:border-yellow-200 hover:shadow'
            }`}
            title={isBookmarked ? "Remove from bookmarks" : "Save for later"}
          >
            <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
            <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-8">
        <div className="text-xl md:text-2xl font-medium text-slate-900 leading-relaxed space-y-4">
          <ReactMarkdown
            components={{
              p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-slate-700 text-lg" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700 text-lg" {...props} />,
              li: ({node, ...props}) => <li className="pl-1" {...props} />,
              code: ({node, ...props}) => <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-slate-200" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
            }}
          >
            {question.text}
          </ReactMarkdown>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
          <Check size={14} />
          {isMultiSelect ? `Select ${question.correctOptionIds.length} correct answers` : "Select the best answer"}
        </div>
      </div>

      {/* Code Snippet */}
      {question.codeSnippet && (
        <div className="mb-10 rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-[#1e1e1e]">
          <div className="flex items-center px-4 py-3 bg-[#252526] border-b border-[#333]">
            <div className="flex gap-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <span className="text-xs text-slate-400 font-mono">Example.ts</span>
          </div>
          <pre className="p-6 overflow-x-auto font-mono text-sm leading-relaxed text-slate-200">
            <code>{question.codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* Options */}
      <div className="grid gap-3 mb-10">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            disabled={isSubmitted}
            className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-start group relative overflow-hidden ${getOptionStyle(option.id)}`}
          >
            {/* Status Icon for Submitted State */}
            {isSubmitted && question.correctOptionIds.includes(option.id) && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                <CheckCircle2 size={24} />
              </div>
            )}
            
            <div className={`flex-shrink-0 w-6 h-6 ${isMultiSelect ? 'rounded-lg' : 'rounded-full'} border-2 mr-5 flex items-center justify-center transition-all duration-300
              ${selectedIds.includes(option.id) 
                ? (isSubmitted && question.correctOptionIds.includes(option.id) 
                    ? 'border-green-500 bg-green-500 text-white scale-110' 
                    : isSubmitted 
                      ? 'border-red-400 bg-red-400 text-white'
                      : 'border-fabric-600 bg-fabric-600 text-white scale-110')
                : 'border-slate-300 bg-white group-hover:border-fabric-400'
              }
            `}>
              {selectedIds.includes(option.id) && <Check size={14} strokeWidth={4} />}
            </div>
            <span className={`text-lg pt-0.5 pr-8 ${isSubmitted && !question.correctOptionIds.includes(option.id) && !selectedIds.includes(option.id) ? 'text-slate-400' : 'text-slate-700'}`}>
              {option.text}
            </span>
          </button>
        ))}
      </div>

      {/* Feedback Section */}
      {isSubmitted && (
        <div className={`mb-8 overflow-hidden rounded-2xl border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              {isCorrect ? (
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                  <CheckCircle2 size={24} />
                </div>
              ) : (
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                  <XCircle size={24} />
                </div>
              )}
              <h3 className={`font-bold text-xl ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                {isCorrect ? "Correct Answer" : "Incorrect"}
              </h3>
            </div>
            
            <div className="pl-14">
              <div className="flex gap-2 items-start text-slate-700 leading-relaxed bg-white/60 p-4 rounded-xl border border-slate-100/50">
                <Lightbulb className="flex-shrink-0 text-yellow-500 mt-1" size={20} />
                <p>{question.explanation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-end pt-4">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
            className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5
              ${selectedIds.length > 0 
                ? 'bg-gradient-to-r from-fabric-600 to-blue-600 text-white hover:shadow-fabric-500/30' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            Check Answer
          </button>
        ) : (
          onNext && (
            <button
              onClick={onNext}
              className="group flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              Next Question <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default QuestionCard;