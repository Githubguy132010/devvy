# Agent Improvement Pull Request

## Agent Information

**Agent(s) Modified**: <!-- Coder / Critic / Debugger / Architect / End User / Multiple -->

## Improvement Summary

<!-- Provide a clear summary of what improvements are being made to the agent(s) -->

## Related Issue

Fixes #<!-- issue number -->
Relates to #<!-- related issues -->

## Problem/Opportunity

<!-- Describe what prompted this improvement -->

### Current Behavior

<!-- Describe how the agent currently behaves -->

### Issues/Limitations

<!-- What problems exist with current agent behavior? -->

- 
- 

### Desired Behavior

<!-- Describe the improved behavior you're implementing -->

## Changes Made

### System Prompt Changes

<!-- If system prompts were modified, describe the changes -->

#### Previous Prompt
```
<!-- Relevant excerpt of previous system prompt -->
```

#### Updated Prompt
```
<!-- Relevant excerpt of updated system prompt -->
```

#### Rationale
<!-- Why these prompt changes improve the agent -->

- 
- 

### Code Changes

<!-- List code changes made to agent implementation -->

- 
- 

### Configuration Changes

<!-- Any changes to agent configuration (temperature, tools, etc.) -->

- **Temperature**: <!-- if changed -->
- **Tools**: <!-- if changed -->
- **Other**: <!-- if changed -->

### Tool Integration

<!-- If this affects how the agent uses tools -->

- 
- 

## Impact on Agent Behavior

### Improvements

<!-- List specific improvements in agent behavior -->

1. **Improvement**: 
   - **Before**: 
   - **After**: 
   - **Benefit**: 

2. **Improvement**: 
   - **Before**: 
   - **After**: 
   - **Benefit**: 

### Agent Interactions

<!-- How does this affect agent-to-agent interactions? -->

- **With Coder**: 
- **With Critic**: 
- **With Debugger**: 
- **With Architect**: 
- **With End User**: 

### Special Commands Affected

<!-- If this affects @review, @brainstorm, or other special commands -->

- [ ] `@review` behavior changed
- [ ] `@brainstorm` behavior changed
- [ ] Direct `@agent-name` calls changed
- [ ] No special commands affected

## Testing

### Test Scenarios

<!-- Describe specific scenarios used to test the improvements -->

#### Scenario 1: <!-- name -->
**Setup**: 
**User Request**: 
**Previous Response**: 
**Improved Response**: 
**Why Better**: 

#### Scenario 2: <!-- name -->
**Setup**: 
**User Request**: 
**Previous Response**: 
**Improved Response**: 
**Why Better**: 

### Test Environment

- **Runtime**: <!-- Bun X.X.X / Node.js X.X.X -->
- **OS**: <!-- macOS / Linux / Windows / WSL -->
- **AI Provider**: <!-- OpenAI / Anthropic / OpenRouter -->
- **Model**: <!-- gpt-4o / claude-3-5-sonnet-20241220 / etc. -->

### Test Cases

#### Functional Testing
- [ ] Agent responds appropriately to direct queries
- [ ] Agent participates correctly in review cycles
- [ ] Agent contributes effectively in brainstorm sessions
- [ ] Agent uses tools correctly (if applicable)
- [ ] Agent handles edge cases well

#### Quality Testing
- [ ] Responses are more accurate
- [ ] Responses are more helpful
- [ ] Responses are clearer
- [ ] Response tone is appropriate
- [ ] Code quality improved (for code-generating agents)

#### Integration Testing
- [ ] Agent works well with other agents
- [ ] No conflicts with existing functionality
- [ ] Conversation flow remains natural
- [ ] Context is properly maintained

### Comparison Testing

<!-- Compare old vs new behavior -->

#### Test Case: <!-- describe test -->

**Previous Version Output:**
```
<!-- What the agent said before -->
```

**Improved Version Output:**
```
<!-- What the agent says now -->
```

**Analysis:**
<!-- Why the new version is better -->

## Agent Personality & Role

### Role Clarity

<!-- How do these changes improve the agent's role clarity? -->

- [ ] Agent role is more clearly defined
- [ ] Agent stays more focused on its specialty
- [ ] Agent provides more specialized value
- [ ] Agent complements other agents better

### Personality Consistency

<!-- How do these changes maintain or improve agent personality? -->

- 
- 

## Quality Metrics

### Response Quality

<!-- If measurable, provide metrics -->

- **Relevance**: <!-- improved / maintained / etc. -->
- **Accuracy**: <!-- improved / maintained / etc. -->
- **Helpfulness**: <!-- improved / maintained / etc. -->
- **Completeness**: <!-- improved / maintained / etc. -->

### User Experience Impact

<!-- How does this improve user experience? -->

1. 
2. 
3. 

## Prompt Engineering Details

<!-- For reviewers interested in prompt engineering aspects -->

### Techniques Used

<!-- What prompt engineering techniques were applied? -->

- [ ] Few-shot examples added
- [ ] Role definition clarified
- [ ] Constraints specified more clearly
- [ ] Output format specified
- [ ] Chain-of-thought reasoning encouraged
- [ ] Tool usage guidance improved
- [ ] Other: <!-- specify -->

### Iteration Process

<!-- How did you arrive at these improvements? -->

1. 
2. 
3. 

## Backward Compatibility

**Breaking Changes**: No / Yes

<!-- If yes, describe impact -->

### API Compatibility

- [ ] Agent API unchanged
- [ ] Agent API modified (describe): 

### Behavior Changes

<!-- Will existing users notice changes? -->

- 
- 

## Documentation

- [ ] Updated agent description in README.md
- [ ] Updated AGENTS.md if technical details changed
- [ ] Updated inline comments in agent code
- [ ] Added examples of improved behavior
- [ ] Updated CLI help if relevant

## Code Quality

- [ ] Code follows project style guidelines
- [ ] ESM imports use `.js` extensions
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling
- [ ] No debugging statements

## Build & Validation

- [ ] `bun run build` succeeds
- [ ] `bun run lint` passes
- [ ] `bun run test` passes
- [ ] No new warnings
- [ ] Tested with multiple AI providers
- [ ] Tested with multiple models

## Examples

### Example Interaction 1

**User Query:**
```
<!-- What the user asked -->
```

**Agent Response:**
```
<!-- How the improved agent responds -->
```

**Why This Is Better:**
<!-- Explanation -->

### Example Interaction 2

**User Query:**
```
<!-- What the user asked -->
```

**Agent Response:**
```
<!-- How the improved agent responds -->
```

**Why This Is Better:**
<!-- Explanation -->

## Future Improvements

### Known Limitations

<!-- What limitations still exist? -->

1. 
2. 

### Potential Enhancements

<!-- What could be further improved? -->

1. 
2. 

## Additional Context

<!-- Any additional information -->

## Checklist

- [ ] I have tested the agent improvements thoroughly
- [ ] I have compared old vs new behavior
- [ ] I have verified improvements with multiple test cases
- [ ] I have tested with different AI models
- [ ] I have verified integration with other agents
- [ ] I have updated all relevant documentation
- [ ] I am ready for code review

## For Reviewers

### Testing Instructions

<!-- How should reviewers test these improvements? -->

1. 
2. 
3. 

### Focus Areas

<!-- What should reviewers focus on? -->

- 
- 

### Questions

<!-- Any specific questions for reviewers? -->

- 
- 
