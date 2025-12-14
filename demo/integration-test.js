#!/usr/bin/env node

/**
 * Integration test to verify the question detection and agent flow
 */

import chalk from 'chalk';
import { orchestrator } from '../dist/core/orchestrator.js';
import { QuestionerAgent } from '../dist/agents/questioner.js';

console.log(chalk.bold.cyan('\n=== Integration Test: Question Detection Flow ===\n'));

// Test 1: Verify questioner agent is registered
console.log(chalk.yellow('Test 1: Questioner Agent Registration'));
try {
  const agent = orchestrator.getAgent('questioner');
  console.log(chalk.green('✓ Questioner agent is registered'));
  console.log(chalk.dim(`  Agent name: ${agent.name}`));
  console.log(chalk.dim(`  Agent role: ${agent.role}`));
} catch (error) {
  console.log(chalk.red('✗ Failed to get questioner agent'));
  process.exit(1);
}

// Test 2: Verify questioner is enabled by default
console.log(chalk.yellow('\nTest 2: Questioner Agent Enabled'));
if (orchestrator.isAgentEnabled('questioner')) {
  console.log(chalk.green('✓ Questioner agent is enabled by default'));
} else {
  console.log(chalk.red('✗ Questioner agent is not enabled'));
  process.exit(1);
}

// Test 3: Verify question detection works
console.log(chalk.yellow('\nTest 3: Question Detection'));
const testMessages = [
  'Should I add error handling?',
  'What about edge cases?',
  'The implementation is complete.',
];

testMessages.forEach((msg, i) => {
  const hasQuestions = QuestionerAgent.hasQuestions(msg);
  const questions = QuestionerAgent.detectQuestions(msg);
  const expected = i < 2; // First two have questions
  
  if (hasQuestions === expected) {
    console.log(chalk.green(`✓ Message ${i + 1}: Correctly detected ${hasQuestions ? 'questions' : 'no questions'}`));
    if (questions.length > 0) {
      console.log(chalk.dim(`  Questions: ${questions.join(', ')}`));
    }
  } else {
    console.log(chalk.red(`✗ Message ${i + 1}: Detection failed`));
    process.exit(1);
  }
});

// Test 4: Verify conversation manager supports questioner role
console.log(chalk.yellow('\nTest 4: Conversation Manager Support'));
import { conversationManager } from '../dist/core/conversation.js';
try {
  const msg = conversationManager.addMessage('questioner', 'Test message from questioner');
  if (msg.role === 'questioner') {
    console.log(chalk.green('✓ Conversation manager accepts questioner role'));
    // Clean up
    conversationManager.clear();
  } else {
    console.log(chalk.red('✗ Role mismatch'));
    process.exit(1);
  }
} catch (error) {
  console.log(chalk.red('✗ Conversation manager error'));
  console.log(chalk.red(`  ${error.message}`));
  process.exit(1);
}

// Test 5: Verify all agents are available
console.log(chalk.yellow('\nTest 5: All Agents Available'));
const expectedAgents = ['coder', 'critic', 'debugger', 'architect', 'enduser', 'questioner'];
let allPresent = true;
expectedAgents.forEach(agentType => {
  try {
    orchestrator.getAgent(agentType);
    console.log(chalk.green(`  ✓ ${agentType}`));
  } catch (error) {
    console.log(chalk.red(`  ✗ ${agentType} not found`));
    allPresent = false;
  }
});

if (!allPresent) {
  process.exit(1);
}

console.log(chalk.bold.green('\n✓ All Integration Tests Passed!\n'));
console.log(chalk.dim('The question detection and agent flow is working correctly.'));
console.log(chalk.dim('Ready for production use.\n'));
