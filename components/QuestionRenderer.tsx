import React from 'react';
import { Question, MultipleChoiceQuestion, DragDropQuestion, HotspotQuestion, DropdownQuestion, UserProgress } from '../types';
import QuestionCard from './QuestionCard';
import DragDropQuestionComponent from './DragDropQuestion';
import HotspotQuestionComponent from './HotspotQuestion';
import DropdownQuestionComponent from './DropdownQuestion';

interface Props {
  question: Question;
  existingAnswer?: UserProgress;
  isBookmarked: boolean;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  onBookmarkToggle: () => void;
  onAnswer: (questionId: number, selectedIds: string[], isCorrect: boolean, mapping?: Record<string, string>) => void;
  onShowCaseStudy: () => void;
  onNext?: () => void;
}

/**
 * QuestionRenderer acts as a router component that renders the appropriate
 * question component based on the question type.
 */
const QuestionRenderer: React.FC<Props> = (props) => {
  const { question } = props;

  // Type guard to check if question has a type property (new format)
  const hasType = 'type' in question;

  if (!hasType) {
    // Legacy question format - treat as MultipleChoice
    // This handles backward compatibility with existing questions.json
    return (
      <QuestionCard
        question={question as any}
        existingAnswer={props.existingAnswer}
        isBookmarked={props.isBookmarked}
        questionIndex={props.questionIndex}
        totalQuestions={props.totalQuestions}
        score={props.score}
        onBookmarkToggle={props.onBookmarkToggle}
        onAnswer={props.onAnswer}
        onShowCaseStudy={props.onShowCaseStudy}
        onNext={props.onNext}
      />
    );
  }

  switch (question.type) {
    case 'MultipleChoice':
      return (
        <QuestionCard
          question={question as any}
          existingAnswer={props.existingAnswer}
          isBookmarked={props.isBookmarked}
          questionIndex={props.questionIndex}
          totalQuestions={props.totalQuestions}
          score={props.score}
          onBookmarkToggle={props.onBookmarkToggle}
          onAnswer={props.onAnswer}
          onShowCaseStudy={props.onShowCaseStudy}
          onNext={props.onNext}
        />
      );

    case 'DragDrop':
      return (
        <DragDropQuestionComponent
          question={question as DragDropQuestion}
          existingAnswer={props.existingAnswer}
          onAnswer={props.onAnswer}
          onNext={props.onNext}
        />
      );

    case 'Hotspot':
      return (
        <HotspotQuestionComponent
          question={question as HotspotQuestion}
          existingAnswer={props.existingAnswer}
          onAnswer={props.onAnswer}
          onNext={props.onNext}
        />
      );

    case 'Dropdown':
      return (
        <DropdownQuestionComponent
          question={question as DropdownQuestion}
          existingAnswer={props.existingAnswer}
          onAnswer={props.onAnswer}
          onNext={props.onNext}
          questionIndex={props.questionIndex}
          totalQuestions={props.totalQuestions}
          score={props.score}
          isBookmarked={props.isBookmarked}
          onBookmarkToggle={props.onBookmarkToggle}
          onShowCaseStudy={props.onShowCaseStudy}
        />
      );

    default:
      // Fallback for unknown types
      return (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p className="text-red-500">Unknown question type</p>
        </div>
      );
  }
};

export default QuestionRenderer;
