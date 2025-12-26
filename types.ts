export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  codeSnippet?: string; // For Python/SQL/DAX snippets
  options: Option[];
  correctOptionIds: string[]; // Array to support multi-select
  explanation: string;
  caseStudyRef?: 'Contoso' | 'Litware' | null;
  domain?: 'Maintain' | 'Prepare' | 'Model' | 'Analyze';
}

export interface UserProgress {
  questionId: number;
  selectedOptionIds: string[];
  isCorrect: boolean;
  timestamp: number;
}

export interface AppState {
  currentQuestionIndex: number;
  answers: Record<number, UserProgress>;
  score: number;
  isReviewMode: boolean;
  bookmarkedQuestionIds: number[];
}