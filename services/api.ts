import { Question } from '../types';

/**
 * Simulates a database connection by fetching a JSON file
 * and providing query capabilities.
 */

interface QueryOptions {
  domain?: string;
  caseStudy?: string;
  shuffle?: boolean;
}

export const fetchQuestions = async (options?: QueryOptions): Promise<Question[]> => {
  try {
    // In a real app, this would be an API endpoint like /api/questions
    const response = await fetch('/questions.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    let data: Question[] = await response.json();

    // 1. Filtering (Simulate SQL WHERE)
    if (options?.domain && options.domain !== 'All') {
      data = data.filter(q => q.domain === options.domain);
    }

    if (options?.caseStudy && options.caseStudy !== 'All') {
      data = data.filter(q => q.caseStudyRef === options.caseStudy);
    }

    // 2. Sorting/Shuffling (Simulate ORDER BY RAND())
    if (options?.shuffle) {
      data = shuffleArray(data);
    }

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
};

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Helper to get unique domains for filter dropdowns
export const getDomains = async (): Promise<string[]> => {
  const questions = await fetchQuestions();
  const domains = new Set(questions.map(q => q.domain).filter(Boolean) as string[]);
  return Array.from(domains).sort();
};
