# Pull Request

## Description

<!-- Provide a clear and concise description of what this PR does -->

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration/Setup change
- [ ] 🤖 Agent improvement (changes to agent behavior or prompts)
- [ ] 🛠️ Refactoring (code restructuring without changing functionality)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test addition or improvement
- [ ] 🔒 Security fix

## Related Issue(s)

<!-- Link to related issues using #issue_number -->

Fixes #
Relates to #

## Changes Made

<!-- Provide a detailed list of changes made in this PR -->

- 
- 
- 

## Testing Performed

<!-- Describe the testing you've done to verify your changes -->

### Test Environment

- **Runtime**: <!-- Bun X.X.X / Node.js X.X.X -->
- **OS**: <!-- macOS / Linux / Windows / WSL -->
- **AI Provider**: <!-- OpenAI / Anthropic / OpenRouter / Custom / N/A -->
- **Model**: <!-- gpt-4o / claude-3-5-sonnet-20241220 / etc. / N/A -->

### Test Cases

<!-- Describe specific test cases you've run -->

- [ ] 
- [ ] 
- [ ] 

### Manual Testing

<!-- Describe manual testing performed, if applicable -->

```
<!-- Example commands run and results observed -->
```

## Impact Analysis

### Components Affected

<!-- List the components that are changed or might be affected -->

- [ ] Agent(s): <!-- Specify which: Coder/Critic/Debugger/Architect/End User -->
- [ ] CLI/Terminal UI
- [ ] Configuration/Setup
- [ ] Tool System
- [ ] LLM Integration
- [ ] Conversation Management
- [ ] Build/Development Tools
- [ ] Documentation

### Breaking Changes

<!-- If this introduces breaking changes, describe them and the migration path -->

**Breaking Changes**: No / Yes

<!-- If yes, describe: -->
<!-- - What breaks -->
<!-- - Why it's necessary -->
<!-- - How users should migrate -->

### Backward Compatibility

<!-- Describe how this change maintains or affects backward compatibility -->

## Code Quality

- [ ] Code follows the project's style guidelines
- [ ] Code includes appropriate comments where needed
- [ ] ESM imports use `.js` extensions (required for Node.js ESM)
- [ ] TypeScript strict mode compliance
- [ ] Error handling is appropriate and robust
- [ ] No console.log debugging statements left in code

## Documentation

- [ ] Updated relevant documentation (README, AGENTS.md, etc.)
- [ ] Added/updated code comments for complex logic
- [ ] Updated CLI help text if commands changed
- [ ] Added examples if introducing new features

## Security

- [ ] No API keys, secrets, or sensitive data committed
- [ ] No new security vulnerabilities introduced
- [ ] Input validation added where appropriate
- [ ] Dependencies checked for known vulnerabilities

## Performance

<!-- If this change affects performance, describe the impact -->

- [ ] No significant performance degradation
- [ ] Performance impact measured and acceptable
- [ ] N/A - No performance impact

## Build & Deployment

- [ ] `bun run build` succeeds
- [ ] `bun run lint` (tsc --noEmit) passes
- [ ] `bun run test` passes (if tests exist)
- [ ] No new build warnings

## Additional Notes

<!-- Any additional information that reviewers should know -->

## Screenshots/Examples

<!-- If applicable, add screenshots or example output to demonstrate the changes -->

```
<!-- Example output or usage -->
```

## Checklist

- [ ] I have read and followed the contributing guidelines
- [ ] I have performed a self-review of my code
- [ ] I have tested my changes thoroughly
- [ ] My changes generate no new warnings or errors
- [ ] I have made corresponding changes to the documentation
- [ ] My commits follow the project's commit message conventions
- [ ] I am willing to address review feedback

## For Reviewers

<!-- Any specific areas you'd like reviewers to focus on -->

### Focus Areas

- 
- 

### Questions for Reviewers

- 
- 
