export interface Option {
  id: string;
  text: string;
}

// ============ Question Type Definitions ============
export type QuestionType = 'MultipleChoice' | 'DragDrop' | 'Hotspot';
export type SelectionType = 'Single' | 'Multiple';
export type CaseStudyRef = 'Contoso' | 'Litware';
export type Domain = 'Maintain' | 'Prepare' | 'Model' | 'Analyze';

interface BaseQuestion {
  id: number;
  text: string;
  codeSnippet?: string;
  explanation: string;
  exhibitUrl?: string; // Optional image for context (diagrams, etc.)
  caseStudyRef?: CaseStudyRef;
  domain?: Domain;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'MultipleChoice';
  selectionType: SelectionType; // Explicit UI mode (Radio vs Checkbox)
  options: Option[];
  correctOptionIds: string[];
}

export interface DragDropItem {
  id: string;
  content: string;
}

export interface DragDropTarget {
  id: string;
  label: string;
}

export interface DragDropQuestion extends BaseQuestion {
  type: 'DragDrop';
  items: DragDropItem[];
  targets: DragDropTarget[];
  correctMapping: Record<string, string>; // itemId -> targetId
}

export interface HotspotArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string; // Optional label for code line selection
}

export interface HotspotQuestion extends BaseQuestion {
  type: 'Hotspot';
  imageUrl?: string;
  areas: HotspotArea[];
  correctAreaIds: string[];
}

export interface DropdownOption {
  id: string;
  text: string;
}

export interface DropdownMenu {
  id: string; // The ID of the menu (e.g. "box1")
  label?: string; // Optional label text above the dropdown
  options: DropdownOption[];
}

export interface DropdownQuestion extends BaseQuestion {
  type: 'Dropdown';
  menus: DropdownMenu[];
  correctMapping: Record<string, string>; // menuId -> correctOptionId
}

// Discriminated union of all question types
export type Question = MultipleChoiceQuestion | DragDropQuestion | HotspotQuestion | DropdownQuestion;

// Legacy type for backward compatibility during migration
export interface LegacyQuestion {
  id: number;
  text: string;
  codeSnippet?: string;
  options: Option[];
  correctOptionIds: string[];
  explanation: string;
  caseStudyRef?: CaseStudyRef | null;
  domain?: Domain;
}

// ============ User Progress ============
export interface UserProgress {
  questionId: number;
  selectedOptionIds: string[];
  // For DragDrop: stores mapping as JSON string
  dragDropMapping?: Record<string, string>;
  // For Hotspot: stores selected area IDs
  selectedAreaIds?: string[];
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