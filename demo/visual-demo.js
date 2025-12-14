#!/usr/bin/env node

/**
 * Create a visual demo showing before/after comparison
 */

import chalk from 'chalk';
import { terminalRenderer } from '../dist/cli/renderer.js';

console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════════╗'));
console.log(chalk.bold.cyan('║         DEVVY TERMINAL IMPROVEMENTS - VISUAL DEMO            ║'));
console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════════╝\n'));

// Show the improvements
console.log(chalk.bold.yellow('═══ FEATURE 1: Enhanced Code Block Rendering ═══\n'));
console.log(chalk.dim('Before: Plain text with no highlighting'));
console.log(chalk.gray('```javascript\nconst app = express();\napp.listen(3000);\n```\n'));

console.log(chalk.dim('After: Syntax-highlighted with beautiful borders'));
const code = `\`\`\`javascript
const express = require('express');
const app = express();

app.get('/api/users', async (req, res) => {
  const users = await db.users.findAll();
  res.json(users);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\``;
console.log(terminalRenderer.highlightCodeBlocks(code));

console.log(chalk.bold.yellow('\n═══ FEATURE 2: Markdown Rendering ═══\n'));
console.log(chalk.dim('Before: Raw markdown text'));
console.log(chalk.gray('## Important\n**Bold** and *italic* text with `code`\n'));

console.log(chalk.dim('After: Rich formatted text'));
const markdown = `## Important
**Bold** and *italic* text with \`inline code\`

### Key Points
* First important point
* Second critical item
* Third essential detail`;
console.log(terminalRenderer.renderMarkdown(markdown));

console.log(chalk.bold.yellow('\n═══ FEATURE 3: New Questioner Agent ═══\n'));
console.log(chalk.cyan('❓ [The Questioner]'));
console.log('Automatically detects and answers questions from other agents!');
console.log(chalk.dim('\nExample: When the Coder asks "Should I add error handling?"'));
console.log(chalk.dim('The Questioner automatically responds with helpful guidance.\n'));

console.log(chalk.bold.yellow('═══ FEATURE 4: Improved Prompt Box ═══\n'));
console.log(chalk.dim('Fixed width calculation and alignment issues'));
console.log(chalk.gray('┌──────────────────────────────────────────────────────────────────────────────┐'));
console.log(chalk.gray('│  📁 ~/work/devvy/devvy                                                       │'));
console.log(chalk.gray('├──────────────────────────────────────────────────────────────────────────────┤'));
console.log(chalk.gray('│ ') + chalk.cyan('You') + chalk.dim(' ❯ ') + 'Tell me about your project...');
console.log(chalk.gray('└──────────────────────────────────────────────────────────────────────────────┘\n'));

console.log(chalk.bold.yellow('═══ FEATURE 5: Loading Animations ═══\n'));
console.log(chalk.cyan('⠋ Thinking...') + chalk.dim(' (Smooth spinner animation while agents think)'));

console.log(chalk.bold.yellow('\n═══ FEATURE 6: All Agents Enhanced ═══\n'));
console.log('💻 ' + chalk.green.bold('[The Coder]     ') + ' - Writes clean, efficient code');
console.log('🔍 ' + chalk.yellow.bold('[The Critic]    ') + ' - Reviews for bugs and best practices');
console.log('🐛 ' + chalk.red.bold('[The Debugger]  ') + ' - Expert at finding and fixing bugs');
console.log('🏗️  ' + chalk.blue.bold('[The Architect] ') + ' - Designs system architecture');
console.log('👤 ' + chalk.magenta.bold('[The End User]  ') + ' - Represents user perspective');
console.log('❓ ' + chalk.cyan.bold('[The Questioner]') + ' - Answers questions automatically ✨ NEW!');

console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════════╗'));
console.log(chalk.bold.cyan('║                    ✨ IMPROVEMENTS SUMMARY ✨                  ║'));
console.log(chalk.bold.cyan('╠════════════════════════════════════════════════════════════════╣'));
console.log(chalk.bold.cyan('║  ✓ Syntax highlighting for code blocks                        ║'));
console.log(chalk.bold.cyan('║  ✓ Better markdown rendering                                   ║'));
console.log(chalk.bold.cyan('║  ✓ Fixed prompt box display                                    ║'));
console.log(chalk.bold.cyan('║  ✓ New Questioner agent                                        ║'));
console.log(chalk.bold.cyan('║  ✓ Automatic question detection                                ║'));
console.log(chalk.bold.cyan('║  ✓ Loading animations                                          ║'));
console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════════╝\n'));
