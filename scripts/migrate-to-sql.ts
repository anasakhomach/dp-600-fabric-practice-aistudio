/**
 * Migration Script: JSON -> Supabase/PostgreSQL
 * Run with: npx tsx scripts/migrate-to-sql.ts
 * 
 * Prerequisites:
 * 1. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 2. Run supabase/schema.sql in your Supabase SQL Editor first
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please create a .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Case Study Mapping (from data.ts)
const CASE_STUDY_MAP: Record<string, number> = {
  'Contoso': 1,
  'Litware': 2,
};

interface LegacyQuestion {
  id: number;
  text: string;
  codeSnippet?: string;
  options?: { id: string; text: string }[];
  correctOptionIds?: string[];
  explanation: string;
  detailedExplanation?: string;
  caseStudyRef?: string;
  domain?: string;
  exhibitUrl?: string;
  type?: string;
  // DragDrop
  items?: { id: string; content: string }[];
  targets?: { id: string; label: string }[];
  correctMapping?: Record<string, string>;
  // Hotspot
  areas?: { id: string; x: number; y: number; width: number; height: number; label?: string }[];
  correctAreaIds?: string[];
  // Dropdown
  menus?: { id: string; label: string; options: { id: string; text: string }[] }[];
}

async function migrateQuestions() {
  const questionsPath = path.join(process.cwd(), 'questions.json');
  const rawData = fs.readFileSync(questionsPath, 'utf-8');
  const questions: LegacyQuestion[] = JSON.parse(rawData);

  console.log(`Migrating ${questions.length} questions...`);

  for (const q of questions) {
    const questionType = q.type || 'MultipleChoice';
    const caseStudyId = q.caseStudyRef ? CASE_STUDY_MAP[q.caseStudyRef] : null;

    // Insert main question
    const { error: qError } = await supabase.from('questions').upsert({
      id: q.id,
      text: q.text,
      domain: q.domain || 'Analyze',
      type: questionType,
      explanation: q.explanation,
      detailed_explanation: q.detailedExplanation || null,
      exhibit_url: q.exhibitUrl || null,
      code_snippet: q.codeSnippet || null,
      case_study_id: caseStudyId,
    });

    if (qError) {
      console.error(`Error inserting question ${q.id}:`, qError.message);
      continue;
    }

    // Handle type-specific data
    if (questionType === 'MultipleChoice' && q.options) {
      for (const opt of q.options) {
        await supabase.from('question_options').upsert({
          question_id: q.id,
          option_key: opt.id,
          text: opt.text,
          is_correct: q.correctOptionIds?.includes(opt.id) || false,
        }, { onConflict: 'question_id,option_key' });
      }
    }

    if (questionType === 'DragDrop') {
      for (const item of q.items || []) {
        await supabase.from('dragdrop_items').upsert({
          id: item.id,
          question_id: q.id,
          content: item.content,
        });
      }
      for (const target of q.targets || []) {
        await supabase.from('dragdrop_targets').upsert({
          id: target.id,
          question_id: q.id,
          label: target.label,
        });
      }
      if (q.correctMapping) {
        for (const [itemId, targetId] of Object.entries(q.correctMapping)) {
          await supabase.from('dragdrop_mappings').upsert({
            item_id: itemId,
            target_id: targetId,
          }, { onConflict: 'item_id' });
        }
      }
    }

    if (questionType === 'Hotspot') {
      for (const area of q.areas || []) {
        await supabase.from('hotspot_areas').upsert({
          id: area.id,
          question_id: q.id,
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
          label: area.label || null,
          is_correct: q.correctAreaIds?.includes(area.id) || false,
        });
      }
    }

    if (questionType === 'Dropdown') {
      for (const menu of q.menus || []) {
        await supabase.from('dropdown_menus').upsert({
          id: menu.id,
          question_id: q.id,
          label: menu.label,
        });
        for (const opt of menu.options) {
          // Use composite ID to avoid collision when menus share option IDs
          const compositeId = `${menu.id}_${opt.id}`;
          await supabase.from('dropdown_options').upsert({
            id: compositeId,
            menu_id: menu.id,
            text: opt.text,
            is_correct: q.correctMapping?.[menu.id] === opt.id || false,
          });
        }
      }
    }

    console.log(`  ✓ Question ${q.id} (${questionType})`);
  }

  console.log('\n✅ Migration complete!');
}

migrateQuestions().catch(console.error);
