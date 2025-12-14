#!/usr/bin/env node

/**
 * Demo script to show the new terminal rendering features
 * This doesn't require API keys - just demonstrates the UI improvements
 */

import chalk from 'chalk';
import { terminalRenderer } from '../dist/cli/renderer.js';
import { terminalUI } from '../dist/cli/ui.js';
import { QuestionerAgent } from '../dist/agents/questioner.js';

console.log(chalk.bold.cyan('\n=== Devvy Terminal Improvements Demo ===\n'));

// Demo 1: Code block highlighting
console.log(chalk.bold.yellow('1. Code Block Syntax Highlighting:\n'));
const sampleCode = `Here's some example code:

\`\`\`typescript
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(result);
\`\`\`

And some JavaScript:

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(3000);
\`\`\`
`;

const highlighted = terminalRenderer.highlightCodeBlocks(sampleCode);
console.log(highlighted);

// Demo 2: Markdown rendering
console.log(chalk.bold.yellow('\n2. Markdown Rendering:\n'));
const markdownText = `# Main Heading

This is a **bold** statement with *italic* text and \`inline code\`.

## Subheading

Here's a list:
* First item
* Second item with **emphasis**
* Third item with \`code\`

### Smaller heading

More text here.`;

const rendered = terminalRenderer.renderMarkdown(markdownText);
console.log(rendered);

// Demo 3: Improved prompt box
console.log(chalk.bold.yellow('\n3. Improved Prompt Box:\n'));
terminalUI.printPromptBox();
console.log(chalk.gray('│ ') + chalk.cyan('You') + chalk.dim(' ❯ ') + 'This is what the prompt looks like');
terminalUI.printPromptBoxBottom();

// Demo 4: Agent icons
console.log(chalk.bold.yellow('\n4. Agent Display:\n'));
const agents = [
  { type: 'coder', name: 'The Coder', icon: '💻', color: chalk.green },
  { type: 'critic', name: 'The Critic', icon: '🔍', color: chalk.yellow },
  { type: 'debugger', name: 'The Debugger', icon: '🐛', color: chalk.red },
  { type: 'architect', name: 'The Architect', icon: '🏗️', color: chalk.blue },
  { type: 'enduser', name: 'The End User', icon: '👤', color: chalk.magenta },
  { type: 'questioner', name: 'The Questioner', icon: '❓', color: chalk.cyan },
];

agents.forEach(agent => {
  console.log(`${agent.icon} ${agent.color(chalk.bold(`[${agent.name}]`))}`);
});

// Demo 5: Question detection
console.log(chalk.bold.yellow('\n5. Question Detection:\n'));

const testText = `I've implemented the feature. Should I add error handling? 
What about logging? I think we should also consider performance. 
The code is ready for review.`;

const questions = QuestionerAgent.detectQuestions(testText);
console.log(chalk.cyan('Original text:'));
console.log(chalk.dim(testText));
console.log(chalk.yellow('\nDetected questions:'));
questions.forEach((q, i) => {
  console.log(chalk.yellow(`   ${i + 1}. ${q}`));
});

// Demo 6: Loading animation preview
console.log(chalk.bold.yellow('\n6. Thinking Animation (brief demo):\n'));
async function demoAnimation() {
  await terminalUI.showThinkingAnimation(2000);
  console.log(chalk.green('✓ Animation complete!'));
}

demoAnimation().then(() => {
  console.log(chalk.bold.cyan('\n=== Demo Complete! ===\n'));
  console.log(chalk.dim('These improvements make the terminal output much more readable and engaging.'));
  console.log(chalk.dim('The Questioner agent will automatically answer questions from other agents.\n'));
});
