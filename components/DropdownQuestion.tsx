import React, { useState, useEffect } from 'react';
import { DropdownQuestion, UserProgress } from '../types';
import { CheckCircle2, XCircle, Lightbulb, ChevronDown, ArrowRight, ListChecks, Trophy, Bookmark, BookOpen } from 'lucide-react';
import QuestionContextImage from './QuestionContextImage';
import DeepDiveSection from './DeepDiveSection';
import QuestionText from './QuestionText';

interface Props {
  question: DropdownQuestion;
  existingAnswer?: UserProgress;
  onAnswer: (questionId: number, selectedIds: string[], isCorrect: boolean, mapping?: Record<string, string>) => void;
  onNext?: () => void;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onShowCaseStudy: () => void;
}

const DropdownQuestionComponent: React.FC<Props> = ({
  question,
  existingAnswer,
  onAnswer,
  onNext,
  questionIndex,
  totalQuestions,
  score,
  isBookmarked,
  onBookmarkToggle,
  onShowCaseStudy,
}) => {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (existingAnswer?.dragDropMapping) {
      setSelections(existingAnswer.dragDropMapping);
      setIsSubmitted(true);
    } else {
      setSelections({});
      setIsSubmitted(false);
    }
  }, [question.id, existingAnswer]);

  const handleSelectionChange = (menuId: string, value: string) => {
    if (isSubmitted) return;
    setSelections(prev => ({
      ...prev,
      [menuId]: value,
    }));
  };

  const handleSubmit = () => {
    const isCorrect = Object.entries(question.correctMapping).every(
      ([menuId, correctOptionId]) => selections[menuId] === correctOptionId
    );

    setIsSubmitted(true);
    // Reuse mapping field for dropdown selections
    onAnswer(question.id, [], isCorrect, selections);
  };

  const isCorrect = existingAnswer?.isCorrect ?? false;
  const allMenusSelected = question.menus.every(menu => selections[menu.id]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
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
            Dropdown
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
        <QuestionText text={question.text} />
        {question.codeSnippet && (
            <div className="mt-4 p-4 bg-slate-900 rounded-xl overflow-x-auto relative group">
                <div className="absolute top-3 right-3 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <pre className="font-mono text-sm text-slate-300 leading-relaxed pt-4">
                    <code>{question.codeSnippet}</code>
                </pre>
            </div>
        )}
        <div className="mt-4 text-sm text-slate-500 font-medium bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
          Select the correct option from each dropdown
        </div>

        {question.exhibitUrl && <div className="mt-4"><QuestionContextImage imageUrl={question.exhibitUrl} /></div>}
      </div>

      <div className="grid gap-6 md:gap-8">
        {question.menus.map((menu) => {
           const selectedOptionId = selections[menu.id];
           const isMenuCorrect = isSubmitted && question.correctMapping[menu.id] === selectedOptionId;
           
           return (
             <div key={menu.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                {menu.label && (
                    <div className="mb-3 text-sm font-bold text-slate-500 uppercase tracking-wide">
                        {menu.label}
                    </div>
                )}
                
                <div className="relative">
                    <select
                        value={selectedOptionId || ''}
                        onChange={(e) => handleSelectionChange(menu.id, e.target.value)}
                        disabled={isSubmitted}
                        className={`w-full p-4 pr-12 rounded-xl appearance-none bg-slate-50 border-2 font-medium text-slate-700 transition-all focus:outline-none focus:ring-4 focus:ring-fabric-100
                            ${isSubmitted 
                                ? isMenuCorrect 
                                    ? 'border-green-400 bg-green-50/30' 
                                    : 'border-red-400 bg-red-50/30'
                                : 'border-slate-200 hover:border-fabric-300 focus:border-fabric-500'
                            }
                        `}
                    >
                        <option value="" disabled>Select an option...</option>
                        {menu.options.map(opt => (
                            <option key={opt.id} value={opt.id}>
                                {opt.text}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    
                    {isSubmitted && (
                        <div className="absolute right-12 top-1/2 -translate-y-1/2">
                            {isMenuCorrect ? (
                                <CheckCircle2 className="text-green-500" size={20} />
                            ) : (
                                <XCircle className="text-red-500" size={20} />
                            )}
                        </div>
                    )}
                </div>

                {isSubmitted && !isMenuCorrect && (
                   <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                       Correct: {menu.options.find(o => o.id === question.correctMapping[menu.id])?.text}
                   </div>
                )}
             </div>
           );
        })}
      </div>

      {/* Feedback Section */}
      {isSubmitted && (
        <div className={`mt-8 overflow-hidden rounded-2xl border shadow-sm w-full ${isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-4">
              {isCorrect ? (
                <div className="p-2 bg-green-100 rounded-full text-green-600 flex-shrink-0">
                  <CheckCircle2 size={24} />
                </div>
              ) : (
                <div className="p-2 bg-red-100 rounded-full text-red-600 flex-shrink-0">
                  <XCircle size={24} />
                </div>
              )}
              <h3 className={`font-bold text-lg md:text-xl ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                {isCorrect ? "Correct Answer" : "Incorrect"}
              </h3>
            </div>
            
            <div className="pl-0 md:pl-12">
              <div className="flex gap-2 items-start text-slate-700 leading-relaxed bg-white/60 p-3 md:p-4 rounded-xl border border-slate-100/50">
                <Lightbulb className="flex-shrink-0 text-yellow-500 mt-0.5" size={18} />
                <p className="text-sm md:text-base">{question.explanation}</p>
              </div>
            </div>
          </div>

          {/* Deep Dive Section */}
          {question.detailedExplanation && (
            <DeepDiveSection content={question.detailedExplanation} />
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-end pt-8">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allMenusSelected}
            className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5
              ${allMenusSelected
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

export default DropdownQuestionComponent;
