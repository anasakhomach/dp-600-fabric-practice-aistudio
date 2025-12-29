import { Question, MultipleChoiceQuestion, DragDropQuestion, HotspotQuestion, DropdownQuestion } from '../types';
import { supabase, DbQuestion, DbQuestionOption } from './supabase';
import { CASE_STUDIES } from '../data';

/**
 * Database API Layer
 * Fetches questions from Supabase (with JSON fallback)
 */

interface QueryOptions {
  domain?: string;
  caseStudy?: string;
  shuffle?: boolean;
}

// Map case_study_id back to the string ref
const CASE_STUDY_ID_MAP: Record<number, 'Contoso' | 'Litware'> = {
  1: 'Contoso',
  2: 'Litware',
};

export const fetchQuestions = async (options?: QueryOptions): Promise<Question[]> => {
  // If Supabase is not configured, fall back to local JSON
  if (!supabase) {
    console.log('[API] Supabase not configured. Using local JSON fallback.');
    return fetchQuestionsFromJson(options);
  }

  try {
    console.log(`[API] Fetching questions from Supabase. Shuffle: ${options?.shuffle}`);

    // Build query
    let query = supabase.from('questions').select('*');

    // Apply filters
    if (options?.domain && options.domain !== 'All') {
      query = query.eq('domain', options.domain);
    }

    if (options?.caseStudy && options.caseStudy !== 'All') {
      const caseStudyId = options.caseStudy === 'Contoso' ? 1 : 2;
      query = query.eq('case_study_id', caseStudyId);
    }

    // Order
    if (options?.shuffle) {
      // Supabase doesn't have native random ordering, so we fetch all and shuffle client-side
      query = query.order('id');
    } else {
      query = query.order('id', { ascending: true });
    }

    const { data: dbQuestions, error } = await query;

    if (error) throw error;
    if (!dbQuestions) return [];

    // Fetch all related data in parallel
    const questionIds = dbQuestions.map(q => q.id);
    
    const [optionsResult, dragItemsResult, dragTargetsResult, dragMappingsResult, hotspotsResult, dropdownMenusResult, dropdownOptionsResult] = await Promise.all([
      supabase.from('question_options').select('*').in('question_id', questionIds),
      supabase.from('dragdrop_items').select('*').in('question_id', questionIds),
      supabase.from('dragdrop_targets').select('*').in('question_id', questionIds),
      supabase.from('dragdrop_mappings').select('*, item:dragdrop_items(question_id)'),
      supabase.from('hotspot_areas').select('*').in('question_id', questionIds),
      supabase.from('dropdown_menus').select('*').in('question_id', questionIds),
      supabase.from('dropdown_options').select('*'),
    ]);

    // Build lookup maps
    const optionsByQuestion = groupBy(optionsResult.data || [], 'question_id');
    const dragItemsByQuestion = groupBy(dragItemsResult.data || [], 'question_id');
    const dragTargetsByQuestion = groupBy(dragTargetsResult.data || [], 'question_id');
    const hotspotsByQuestion = groupBy(hotspotsResult.data || [], 'question_id');
    const dropdownMenusByQuestion = groupBy(dropdownMenusResult.data || [], 'question_id');
    const dropdownOptionsByMenu = groupBy(dropdownOptionsResult.data || [], 'menu_id');

    // Build correct mappings for DragDrop
    const dragMappings: Record<number, Record<string, string>> = {};
    for (const mapping of dragMappingsResult.data || []) {
      const questionId = mapping.item?.question_id;
      if (questionId) {
        if (!dragMappings[questionId]) dragMappings[questionId] = {};
        dragMappings[questionId][mapping.item_id] = mapping.target_id;
      }
    }

    // Transform to frontend Question types
    const questions: Question[] = dbQuestions.map(dbQ => {
      const baseQuestion = {
        id: dbQ.id,
        text: dbQ.text,
        explanation: dbQ.explanation || '',
        detailedExplanation: dbQ.detailed_explanation || undefined,
        domain: dbQ.domain as any,
        caseStudyRef: dbQ.case_study_id ? CASE_STUDY_ID_MAP[dbQ.case_study_id] : undefined,
        codeSnippet: dbQ.code_snippet || undefined,
        exhibitUrl: dbQ.exhibit_url || undefined,
      };

      if (dbQ.type === 'DragDrop') {
        return {
          ...baseQuestion,
          type: 'DragDrop',
          items: (dragItemsByQuestion[dbQ.id] || []).map(i => ({ id: i.id, content: i.content })),
          targets: (dragTargetsByQuestion[dbQ.id] || []).map(t => ({ id: t.id, label: t.label })),
          correctMapping: dragMappings[dbQ.id] || {},
        } as DragDropQuestion;
      }

      if (dbQ.type === 'Hotspot') {
        const areas = hotspotsByQuestion[dbQ.id] || [];
        return {
          ...baseQuestion,
          type: 'Hotspot',
          areas: areas.map(a => ({ id: a.id, x: a.x, y: a.y, width: a.width, height: a.height, label: a.label })),
          correctAreaIds: areas.filter(a => a.is_correct).map(a => a.id),
        } as HotspotQuestion;
      }

      if (dbQ.type === 'Dropdown') {
        const menus = dropdownMenusByQuestion[dbQ.id] || [];
        const menusWithOptions = menus.map(menu => ({
          id: menu.id,
          label: menu.label,
          options: (dropdownOptionsByMenu[menu.id] || []).map((opt: any) => ({ id: opt.id, text: opt.text })),
        }));
        const correctMapping: Record<string, string> = {};
        for (const menu of menus) {
          const correctOpt = (dropdownOptionsByMenu[menu.id] || []).find((o: any) => o.is_correct);
          if (correctOpt) correctMapping[menu.id] = correctOpt.id;
        }
        return {
          ...baseQuestion,
          type: 'Dropdown',
          menus: menusWithOptions,
          correctMapping,
        } as DropdownQuestion;
      }

      // Default: MultipleChoice
      const opts = optionsByQuestion[dbQ.id] || [];
      return {
        ...baseQuestion,
        type: 'MultipleChoice',
        selectionType: opts.filter(o => o.is_correct).length > 1 ? 'Multiple' : 'Single',
        options: opts.map(o => ({ id: o.option_key, text: o.text })),
        correctOptionIds: opts.filter(o => o.is_correct).map(o => o.option_key),
      } as MultipleChoiceQuestion;
    });

    // Client-side shuffle if requested
    if (options?.shuffle) {
      return shuffleArray(questions);
    }

    return questions;
  } catch (error) {
    console.error('[API] Supabase Error:', error);
    console.log('[API] Falling back to local JSON.');
    return fetchQuestionsFromJson(options);
  }
};

// ============ Fallback: Local JSON ============
const fetchQuestionsFromJson = async (options?: QueryOptions): Promise<Question[]> => {
  const response = await fetch(`${import.meta.env.BASE_URL}questions.json`);
  if (!response.ok) throw new Error(`Failed to fetch questions: ${response.statusText}`);

  let data: Question[] = await response.json();

  if (options?.domain && options.domain !== 'All') {
    data = data.filter(q => q.domain === options.domain);
  }

  if (options?.caseStudy && options.caseStudy !== 'All') {
    data = data.filter(q => q.caseStudyRef === options.caseStudy);
  }

  if (options?.shuffle) {
    return shuffleArray(data);
  } else {
    return [...data].sort((a, b) => a.id - b.id);
  }
};

// ============ Analytics Tracking ============
export const trackQuestionAttempt = async (
  sessionId: string,
  questionId: number,
  isCorrect: boolean,
  timeSpentSeconds: number
): Promise<void> => {
  if (!supabase) return;

  await supabase.from('question_attempts').insert({
    user_session_id: sessionId,
    question_id: questionId,
    is_correct: isCorrect,
    time_spent_seconds: timeSpentSeconds,
  });
};

export const createUserSession = async (): Promise<string | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase.from('user_sessions').insert({
    metadata: {
      userAgent: navigator.userAgent,
      language: navigator.language,
    }
  }).select('id').single();

  return data?.id || null;
};

// ============ Helpers ============
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const groupBy = <T extends Record<string, any>>(arr: T[], key: string): Record<string, T[]> => {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

export const getDomains = async (): Promise<string[]> => {
  const questions = await fetchQuestions();
  const domains = new Set(questions.map(q => q.domain).filter(Boolean) as string[]);
  return Array.from(domains).sort();
};
