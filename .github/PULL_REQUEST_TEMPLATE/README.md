# Pull Request Templates

This directory contains specialized pull request templates for different types of contributions to Devvy.

## Available Templates

### 🐛 [Bug Fix](bug_fix.md)
Use this template when fixing a bug or resolving an issue with existing functionality.
- Includes sections for root cause analysis
- Requires before/after testing
- Focuses on regression prevention

### ✨ [Feature](feature.md)
Use this template when adding new functionality or capabilities.
- Comprehensive feature documentation
- Usage examples and test cases
- Impact analysis and backward compatibility

### 🤖 [Agent Improvement](agent_improvement.md)
Use this template when modifying agent behavior, prompts, or capabilities.
- Agent-specific testing scenarios
- Prompt engineering details
- Agent interaction impact analysis

### 📚 [Documentation](documentation.md)
Use this template for documentation-only changes.
- Accuracy and clarity checks
- Link verification
- Target audience considerations

### 🔧 [Refactoring](refactoring.md)
Use this template when restructuring code without changing functionality.
- Before/after code comparisons
- Behavior preservation verification
- Code quality metrics

## How to Use

### When Creating a PR

1. **Choose the appropriate template** based on your change type
2. **Use the query parameter** in your PR URL:
   ```
   ?template=bug_fix.md
   ?template=feature.md
   ?template=agent_improvement.md
   ?template=documentation.md
   ?template=refactoring.md
   ```

3. **Or select from the dropdown** when creating a PR in GitHub's web interface

### Default Template

If you don't specify a template, the default template (`.github/pull_request_template.md`) will be used, which provides a general-purpose structure suitable for most changes.

## Template Structure

All templates follow a similar structure:
- **Clear description** of the changes
- **Type classification** for easy categorization
- **Testing requirements** appropriate to the change type
- **Impact analysis** to understand scope
- **Quality checklists** to ensure completeness
- **Documentation** requirements
- **Reviewer guidance** for effective code review

## Tips for Great PRs

1. **Be descriptive**: Fill out all relevant sections thoroughly
2. **Show your work**: Include test results, screenshots, examples
3. **Think about reviewers**: Make it easy for them to understand and verify your changes
4. **Keep it focused**: Smaller, focused PRs are easier to review
5. **Link issues**: Always reference related issues
6. **Test thoroughly**: Verify your changes work across different environments

## Contributing

If you have suggestions for improving these templates, please open an issue or submit a PR!
