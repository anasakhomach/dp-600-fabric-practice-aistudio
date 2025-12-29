import React, { useState, useEffect } from 'react';
import { HotspotQuestion as HotspotQuestionType, UserProgress } from '../types';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, MousePointer2 } from 'lucide-react';
import QuestionContextImage from './QuestionContextImage';

interface Props {
  question: HotspotQuestionType;
  existingAnswer?: UserProgress;
  onAnswer: (questionId: number, selectedIds: string[], isCorrect: boolean) => void;
  onNext?: () => void;
}

const HotspotQuestionComponent: React.FC<Props> = ({
  question,
  existingAnswer,
  onAnswer,
  onNext,
}) => {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (existingAnswer?.selectedAreaIds) {
      setSelectedAreas(existingAnswer.selectedAreaIds);
      setIsSubmitted(true);
    } else {
      setSelectedAreas([]);
      setIsSubmitted(false);
    }
  }, [question.id, existingAnswer]);

  const handleAreaClick = (areaId: string) => {
    if (isSubmitted) return;

    setSelectedAreas(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleSubmit = () => {
    const correctSet = new Set(question.correctAreaIds);
    const selectedSet = new Set(selectedAreas);
    const isCorrect =
      correctSet.size === selectedSet.size &&
      [...correctSet].every(id => selectedSet.has(id));

    setIsSubmitted(true);
    onAnswer(question.id, selectedAreas, isCorrect);
  };

  const isCorrect = existingAnswer?.isCorrect ?? false;

  const getAreaStyle = (areaId: string) => {
    const isSelected = selectedAreas.includes(areaId);
    const isAreaCorrect = question.correctAreaIds.includes(areaId);

    if (!isSubmitted) {
      return isSelected
        ? 'border-fabric-600 bg-fabric-100/50 ring-2 ring-fabric-300'
        : 'border-slate-300 hover:border-fabric-400 hover:bg-fabric-50/30';
    }

    if (isAreaCorrect) {
      return 'border-green-500 bg-green-100/50 ring-2 ring-green-300';
    }

    if (isSelected && !isAreaCorrect) {
      return 'border-red-400 bg-red-100/50';
    }

    return 'border-slate-200 opacity-50';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
      {/* Question Text */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-medium text-slate-900 leading-relaxed">
          {question.text}
        </h2>
        <div className="mt-4 text-sm text-slate-500 font-medium bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
          Select {question.correctAreaIds.length} location{question.correctAreaIds.length !== 1 ? 's' : ''} on the image/code below
        </div>

        {question.exhibitUrl && <div className="mt-4"><QuestionContextImage imageUrl={question.exhibitUrl} /></div>}
      </div>

      {/* Hotspot Area - Image based */}
      {question.imageUrl && (
        <div className="relative mb-8 rounded-xl overflow-hidden border border-slate-200 shadow-lg">
          <img
            src={question.imageUrl}
            alt="Hotspot diagram"
            className="w-full"
          />
          {question.areas.map((area) => (
            <button
              key={area.id}
              onClick={() => handleAreaClick(area.id)}
              disabled={isSubmitted}
              className={`absolute border-2 rounded-lg transition-all cursor-pointer ${getAreaStyle(area.id)}`}
              style={{
                left: `${area.x}%`,
                top: `${area.y}%`,
                width: `${area.width}%`,
                height: `${area.height}%`,
              }}
            >
              {isSubmitted && question.correctAreaIds.includes(area.id) && (
                <div className="absolute -top-2 -right-2">
                  <CheckCircle2 size={20} className="text-green-500 bg-white rounded-full" />
                </div>
              )}
              {isSubmitted && selectedAreas.includes(area.id) && !question.correctAreaIds.includes(area.id) && (
                <div className="absolute -top-2 -right-2">
                  <XCircle size={20} className="text-red-500 bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Code Snippet based hotspot (line selection) */}
      {question.codeSnippet && !question.imageUrl && (
        <div className="mb-8 rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-[#1e1e1e]">
          <div className="flex items-center px-4 py-3 bg-[#252526] border-b border-[#333]">
            <div className="flex gap-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <span className="text-xs text-slate-400 font-mono">Select the correct line(s)</span>
          </div>
          <div className="p-4 font-mono text-sm">
            {question.areas.map((area) => (
              <button
                key={area.id}
                onClick={() => handleAreaClick(area.id)}
                disabled={isSubmitted}
                className={`block w-full text-left px-4 py-2 rounded transition-all ${
                  isSubmitted
                    ? question.correctAreaIds.includes(area.id)
                      ? 'bg-green-900/30 text-green-300'
                      : selectedAreas.includes(area.id)
                        ? 'bg-red-900/30 text-red-300'
                        : 'text-slate-400'
                    : selectedAreas.includes(area.id)
                      ? 'bg-fabric-900/30 text-fabric-300'
                      : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <span className="text-slate-500 mr-4 select-none">{area.label || area.id}</span>
                {area.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {isSubmitted && (
        <div className={`mt-8 overflow-hidden rounded-2xl border shadow-sm ${isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
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
      <div className="flex justify-end pt-8">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAreas.length === 0}
            className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5
              ${selectedAreas.length > 0
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

export default HotspotQuestionComponent;
