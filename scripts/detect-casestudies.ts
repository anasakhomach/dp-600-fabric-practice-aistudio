/**
 * Script to detect case study references in questions
 * Run with: npx ts-node scripts/detect-casestudies.ts
 * 
 * This script scans questions.json for keywords like "Contoso", "Litware"
 * and auto-tags questions with caseStudyRef if missing.
 */

import * as fs from 'fs';
import * as path from 'path';

interface LegacyQuestion {
  id: number;
  text: string;
  codeSnippet?: string;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  explanation: string;
  caseStudyRef?: 'Contoso' | 'Litware' | null;
  domain?: string;
}

const CASE_STUDY_KEYWORDS = {
  Contoso: ['Contoso', 'ResearchReviewersGroup', 'Productline1', 'Productline2', 'storage1', 'storage2'],
  Litware: ['Litware', 'AnalyticsPOC', 'DataEngPOC', 'DataSciPOC', 'SurveyMonkey'],
};

function detectCaseStudy(question: LegacyQuestion): 'Contoso' | 'Litware' | null {
  const searchText = `${question.text} ${question.explanation || ''} ${question.codeSnippet || ''}`;
  
  for (const [caseStudy, keywords] of Object.entries(CASE_STUDY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        return caseStudy as 'Contoso' | 'Litware';
      }
    }
  }
  
  return null;
}

function main() {
  const questionsPath = path.join(process.cwd(), 'questions.json');
  
  if (!fs.existsSync(questionsPath)) {
    console.error('questions.json not found at:', questionsPath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(questionsPath, 'utf-8');
  const questions: LegacyQuestion[] = JSON.parse(rawData);

  let updatedCount = 0;
  const updatedQuestions = questions.map(q => {
    if (!q.caseStudyRef) {
      const detected = detectCaseStudy(q);
      if (detected) {
        updatedCount++;
        console.log(`[ID ${q.id}] Detected: ${detected}`);
        return { ...q, caseStudyRef: detected };
      }
    }
    return q;
  });

  if (updatedCount > 0) {
    // Backup original file
    const backupPath = questionsPath.replace('.json', `.backup-${Date.now()}.json`);
    fs.copyFileSync(questionsPath, backupPath);
    console.log(`\nBackup created: ${backupPath}`);

    // Write updated file
    fs.writeFileSync(questionsPath, JSON.stringify(updatedQuestions, null, 2));
    console.log(`\nUpdated ${updatedCount} questions with case study references.`);
  } else {
    console.log('No questions needed updating.');
  }

  // Summary
  const contosoCount = updatedQuestions.filter(q => q.caseStudyRef === 'Contoso').length;
  const litwareCount = updatedQuestions.filter(q => q.caseStudyRef === 'Litware').length;
  const noRefCount = updatedQuestions.filter(q => !q.caseStudyRef).length;

  console.log('\n--- Summary ---');
  console.log(`Total questions: ${updatedQuestions.length}`);
  console.log(`Contoso: ${contosoCount}`);
  console.log(`Litware: ${litwareCount}`);
  console.log(`No case study: ${noRefCount}`);
}

main();
