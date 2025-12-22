# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Devvy is a terminal-based multi-agent coding assistant where AI agents collaborate, argue, and brainstorm together to help users code. The project is built with TypeScript and uses Bun as the runtime (Node.js v18+ also supported).

## Common Development Commands

```bash
# Build the project
bun run build

# Run in development mode (from source)
bun run dev

# Run the compiled version
bun run start

# Run tests
bun run test

# Type checking (lint)
bun run lint

# Install dependencies
bun install

# Run a single test file
bun test tests/agents.test.ts

# Global installation for development
bun link devvy
```

## Architecture Overview

### Multi-Agent System

Devvy implements a collaborative multi-agent system with five specialized agents:

1. **The Coder** (`src/agents/coder.ts`) - Writes clean, efficient code
2. **The Critic** (`src/agents/critic.ts`) - Reviews code for bugs, security, and best practices
3. **The Debugger** (`src/agents/debugger.ts`) - Expert at finding and fixing bugs
4. **The Architect** (`src/agents/architect.ts`) - Designs system architecture and structure
5. **The End User** (`src/agents/enduser.ts`) - Represents real user perspective

All agents extend `BaseAgent` (`src/agents/base.ts`) which provides:
- Message building with conversation context
- Streaming and non-streaming response methods
- Integration with the LLM client
- Tool execution support

### Core Components

- **`src/core/llm.ts`**: LLM client abstraction supporting multiple providers (OpenAI, Anthropic, OpenRouter, Gemini, custom)
- **`src/core/conversation.ts`**: Manages conversation history shared across all agents
- **`src/core/orchestrator.ts`**: Coordinates agent interactions and special commands
- **`src/config/index.ts`**: Configuration management using `conf` package
- **`src/cli/`**: Command-line interface, terminal UI, and user interaction
- **`src/tools/`**: Tool system that agents can use (bash, file operations, etc.)

### Tool System

Agents can use tools to interact with the environment:
- **bash**: Execute shell commands
- **write_file**: Create or overwrite files
- **edit_file**: Edit files using search and replace
- **read_file**: Read file contents
- **list_files**: List files and directories

Tools are registered in `src/tools/registry.ts` and initialized via `src/tools/init.ts`.

## Code Style and Conventions

### TypeScript Standards

- Use **strict mode** (enabled in tsconfig.json)
- Use **ESM modules** with `.js` extensions in imports (required for Node.js ESM)
- Use **verbatimModuleSyntax** for explicit import/export statements
- Target ES2022 with modern JavaScript features
- Prefer explicit types over implicit any
- Use proper null/undefined checking

### File Organization

```
src/
├── agents/         # Agent implementations
├── cli/           # CLI commands and UI
├── config/        # Configuration management
├── core/          # Core business logic
├── formatter/     # Output formatting
└── tools/         # Tool definitions and registry
```

### Naming Conventions

- Files: `kebab-case.ts` (e.g., `base-agent.ts`, `llm-client.ts`)
- Classes: `PascalCase` (e.g., `BaseAgent`, `CoderAgent`)
- Functions/variables: `camelCase` (e.g., `buildMessages`, `systemPrompt`)
- Constants: `UPPER_SNAKE_CASE` for global constants (e.g., `CODER_SYSTEM_PROMPT`)
- Exports: Use named exports for singletons (e.g., `export const coderAgent = new CoderAgent()`)

### Agent Implementation Pattern

When creating or modifying agents:
1. Extend `BaseAgent` class
2. Define a system prompt constant
3. Set appropriate `temperature` and `useTools` configuration
4. Implement `getSpecializedPrompt()` method
5. Export a singleton instance

Example:
```typescript
const AGENT_SYSTEM_PROMPT = `You are...`;

export class MyAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Agent Name',
      role: 'agent-role',
      systemPrompt: AGENT_SYSTEM_PROMPT,
      temperature: 0.7,
      useTools: true,
    });
  }

  getSpecializedPrompt(task: string): string {
    return `Task: ${task}...`;
  }
}

export const myAgent = new MyAgent();
```

## Dependencies and Package Management

- **Runtime**: Bun (Node.js >=18.0.0 also supported)
- **Package Manager**: Bun (uses bun.lock)
- **Key Dependencies**:
  - `openai`: LLM API client
  - `@google/genai`: Gemini API client
  - `commander`: CLI framework
  - `inquirer` / `@inquirer/prompts`: Interactive prompts
  - `chalk`: Terminal colors
  - `ora`: Spinners
  - `conf`: Configuration storage
  - `dotenv`: Environment variables

## Configuration

- Configuration is stored using the `conf` package (persistent)
- Environment variables supported: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`, `GOOGLE_API_KEY`
- Config keys: `apiKey`, `apiProvider`, `model`, `apiBaseUrl`, `setupComplete`
- Supported providers: OpenAI, Anthropic, OpenRouter, Gemini, custom endpoints

## CLI Structure

The CLI uses `commander` for command routing:
- Default command: `chat` (interactive session)
- `setup`: Interactive setup wizard
- `config`: Configuration management subcommands

Special in-chat commands (handled by orchestrator):
- `@agent-name`: Direct agent message
- `@review`: Trigger code review cycle
- `@brainstorm`: All agents collaborate
- `/model`, `/config`, `/clear`, `/history`, `/help`, `/exit`

## Testing Approach

- Test framework: Bun's built-in test runner
- Test files are located in `tests/` directory
- Mock implementations are used for external dependencies (LLM client, conversation manager)
- When adding tests:
  - Unit tests for individual functions/classes
  - Integration tests for agent interactions
  - Mock LLM responses for deterministic testing

## Important Implementation Details

### ESM Module System

The project uses **ESM** (ECMAScript Modules), so all imports must use `.js` extensions even when importing TypeScript files. This is required for Node.js ESM compatibility.

### Tool Execution Flow

1. Agents receive messages and build context with conversation history
2. LLM client handles streaming responses and tool calls
3. Tool calls are executed through the registry system
4. Tool results are fed back into the conversation
5. Process continues until no more tool calls are needed

### Error Handling

- All errors are wrapped in custom error types from `src/core/errors.js`
- Use `createErrorFromUnknown()` to handle unknown errors
- Configuration validation happens before API calls
- Process cleanup is handled through `src/core/process.js`

## Common Patterns

### Adding a New Tool

1. Create tool file in `src/tools/` (e.g., `my-tool.ts`)
2. Implement tool with proper types and error handling
3. Register in `src/tools/registry.ts`
4. Update agent system prompts to mention the new tool

### Adding a New Agent

1. Create agent file in `src/agents/` (e.g., `specialist.ts`)
2. Extend `BaseAgent` following the pattern above
3. Export singleton instance
4. Add to `src/agents/index.ts`
5. Update orchestrator if special behavior needed
6. Update README with agent description

### Modifying LLM Integration

- Changes to LLM client affect all agents
- Support multiple providers via adapter pattern
- Handle streaming and non-streaming consistently
- Manage tool calls in the message flow

## Security Considerations

- Never commit API keys
- API keys stored using `conf` package (user's home directory)
- Support for custom API endpoints requires validation
- File system tools should validate paths and permissions
- All shell commands execute through the bash tool with proper sandboxing

## Build Output

- The `dist/` directory contains compiled JavaScript output
- The entry point is `dist/index.js` with a shebang for CLI usage
- Source maps are generated for debugging
- Type declaration files are generated for TypeScript consumers