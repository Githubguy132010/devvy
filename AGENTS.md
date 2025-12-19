# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Pre-Submission Checks

Before submitting any changes, you **must** perform the following checks:

1. **Run Tests**: Execute `bun test` to run the test suite. All tests must pass.
2. **Run Build**: Execute `bun run build` to ensure the project compiles without errors.

## Non-Obvious Project-Specific Information

- **ESM Imports**: All imports must use `.js` extensions (required for Node.js ESM compatibility)
- **TypeScript Config**: `verbatimModuleSyntax` enabled - affects import/export syntax
- **Tool Calls**: Streaming tool calls accumulated using Map with index for partial chunks
- **Agent Tool Loop**: BaseAgent has tool call loop with max 10 iterations to prevent infinite loops
- **Tool Initialization**: Tools auto-initialize on import of `src/tools/init.js`
- **API Key Priority**: Environment variable for current provider > any provider env var > stored config
- **Shared Conversation**: All agents share history via `conversationManager` singleton
- **Special Commands**: In-chat commands (@agent-name, @review, etc.) handled by orchestrator
- **Persistent Config**: Uses 'conf' package for storage in user home directory
- **Multi-Provider LLM**: Supports providers via configurable `baseURL`
- **Streaming Tools**: Tool execution output yielded as part of response stream
- **Lint Command**: `tsc --noEmit` performs type checking only (no style linting)
- **Run Modes**: `dev` runs from `src/`, `start` runs compiled `dist/` version

See `.github/copilot-instructions.md` for detailed project overview and conventions.
