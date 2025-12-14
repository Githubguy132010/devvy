# Devvy - GitHub Copilot Instructions

## Project Overview

Devvy is a terminal-based multi-agent coding assistant where AI agents collaborate, argue, and brainstorm together to help users code. The project is built with TypeScript and uses Bun as the runtime (Node.js v18+ also supported).

## Architecture

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

- **`src/core/llm.ts`**: LLM client abstraction supporting multiple providers (OpenAI, Anthropic, OpenRouter, custom)
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
  - `commander`: CLI framework
  - `inquirer` / `@inquirer/prompts`: Interactive prompts
  - `chalk`: Terminal colors
  - `ora`: Spinners
  - `conf`: Configuration storage
  - `dotenv`: Environment variables

## Build and Test Commands

```bash
bun run build    # Compile TypeScript to dist/
bun run dev      # Run directly from src/
bun run start    # Run compiled version
bun run test     # Run tests with bun
bun run lint     # Type check without emitting files
```

## Configuration

- Configuration is stored using the `conf` package (persistent)
- Environment variables supported: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`
- Config keys: `apiKey`, `apiProvider`, `model`, `apiBaseUrl`, `setupComplete`

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

## Code Quality Guidelines

1. **Error Handling**: Always handle errors appropriately, especially for async operations and external API calls
2. **Type Safety**: Avoid `any` types; use proper interfaces and types
3. **Documentation**: Add comments for complex logic and non-obvious decisions
4. **Tool Usage**: When agents work with files, use the tool system (don't just output code)
5. **Conversation Context**: Agents should consider full conversation history when responding
6. **Streaming**: Prefer streaming responses for better UX in interactive mode

## Testing Approach

- Test framework: Bun's built-in test runner
- Currently no tests exist, but follow these patterns when adding:
  - Unit tests for individual functions/classes
  - Integration tests for agent interactions
  - Mock LLM responses for deterministic testing

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

## Important Notes

- The project uses **ESM** (ECMAScript Modules), so all imports must use `.js` extensions
- The `dist/` directory is the build output (TypeScript compiled to JavaScript)
- The entry point is `dist/index.js` with a shebang for CLI usage
- Configuration is user-specific and stored via the `conf` package
- All agents share the same conversation history via `conversationManager`
- Tools are executed by the LLM client and results are fed back into the conversation

## Security Considerations

- Never commit API keys
- API keys stored using `conf` package (user's home directory)
- Support for custom API endpoints requires validation
- File system tools should validate paths and permissions

## Future Enhancements

When working on new features, consider:
- Context window management for long conversations
- Persistent conversation storage
- Message summarization for older context
- Additional specialized agents
- More sophisticated tool capabilities
