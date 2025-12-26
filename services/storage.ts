import { AppState, UserProgress } from '../types';

const STORAGE_KEY = 'dp600_progress_v1';

export const saveProgress = (state: AppState) => {
  try {
    const dataToSave = {
      answers: state.answers,
      score: state.score,
      bookmarkedQuestionIds: state.bookmarkedQuestionIds
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
};

export const loadProgress = (): Partial<AppState> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
};

export const clearProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
};