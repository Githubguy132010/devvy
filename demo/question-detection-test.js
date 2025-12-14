#!/usr/bin/env node

/**
 * Test script for question detection functionality
 */

import chalk from 'chalk';
import { QuestionerAgent } from '../dist/agents/questioner.js';

console.log(chalk.bold.cyan('\n=== Question Detection Tests ===\n'));

const testCases = [
  {
    name: 'Direct questions with question marks',
    text: 'Should I add error handling? What about logging?',
    expectedCount: 2,
  },
  {
    name: 'Modal verb questions without question marks',
    text: 'Could we use a different approach here. Should I implement this feature now',
    expectedCount: 2,
  },
  {
    name: 'Wh-questions',
    text: 'What framework should we use? How do I implement this?',
    expectedCount: 2,
  },
  {
    name: 'No questions (statements)',
    text: 'I have implemented the feature. The code is ready for review.',
    expectedCount: 0,
  },
  {
    name: 'Mixed content',
    text: 'I implemented the function. Should I add tests? The implementation looks good. What about edge cases?',
    expectedCount: 2,
  },
  {
    name: 'Questions with "please"',
    text: 'Please tell me which approach is better. Please clarify the requirements',
    expectedCount: 2,
  },
  {
    name: 'Thoughts and suggestions patterns',
    text: 'Any thoughts on this approach? Any suggestions on how to proceed?',
    expectedCount: 2,
  },
  {
    name: 'Do/Does/Did questions',
    text: 'Does this implementation meet the requirements? Do we need more tests?',
    expectedCount: 2,
  },
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(chalk.bold.yellow(`\nTest ${index + 1}: ${testCase.name}`));
  console.log(chalk.dim(`Input: "${testCase.text}"`));
  
  const questions = QuestionerAgent.detectQuestions(testCase.text);
  const hasQuestions = QuestionerAgent.hasQuestions(testCase.text);
  
  console.log(chalk.cyan(`Detected ${questions.length} question(s):`));
  questions.forEach((q, i) => {
    console.log(chalk.dim(`  ${i + 1}. ${q}`));
  });
  
  const success = questions.length === testCase.expectedCount;
  const expectedHasQuestions = testCase.expectedCount > 0;
  const hasQuestionsCorrect = hasQuestions === expectedHasQuestions;
  
  if (success && hasQuestionsCorrect) {
    console.log(chalk.green('✓ PASS'));
    passed++;
  } else {
    console.log(chalk.red(`✗ FAIL - Expected ${testCase.expectedCount}, got ${questions.length}`));
    failed++;
  }
});

console.log(chalk.bold.cyan('\n=== Test Summary ===\n'));
console.log(chalk.green(`Passed: ${passed}/${testCases.length}`));
if (failed > 0) {
  console.log(chalk.red(`Failed: ${failed}/${testCases.length}`));
}
console.log();

process.exit(failed > 0 ? 1 : 0);
