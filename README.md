# Devvy 🤖

A terminal-based multi-agent coding assistant where AI agents collaborate, argue, and brainstorm together to help you code.

## Features

- **Multiple Specialized Agents**: Each with a unique perspective
  - 💻 **The Coder**: Writes clean, efficient code
  - 🔍 **The Critic**: Reviews code for bugs, security issues, and best practices
  - 🐛 **The Debugger**: Expert at finding and fixing bugs
  - 🏗️ **The Architect**: Designs system architecture and structure
  - 👤 **The End User**: Represents real user perspective, asks questions others might miss

- **Collaborative Discussion**: All agents see the entire conversation and can brainstorm together
- **Review Cycles**: Iterative code review process where agents work together to improve code
- **BYOK (Bring Your Own Key)**: Use your own API key with multiple providers

## Installation

```bash
# Clone the repository
git clone https://github.com/Githubguy132010/devvy.git
cd devvy

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

## Quick Start

On first run, Devvy will guide you through an interactive setup wizard:

```bash
devvy
```

The setup wizard will help you:
1. Select your AI provider (OpenAI, Anthropic, OpenRouter, or custom)
2. Enter your API key
3. Choose your default model

You can also run the setup wizard anytime with:
```bash
devvy setup
```

## Supported Providers

- **OpenAI** - GPT-4, GPT-4o, GPT-4-turbo
- **Anthropic** - Claude 3.5, Claude 3
- **OpenRouter** - Access to 100+ models from various providers
- **Custom** - Any OpenAI-compatible API endpoint

## Configuration

### Interactive Setup (Recommended)

```bash
devvy setup
```

### Manual Configuration

```bash
# Set your API key
devvy config set-key your-api-key-here

# Set provider (openai, anthropic, openrouter, custom)
devvy config set-provider openrouter

# Select model interactively (fetches available models from API)
devvy config set-model

# Or set model directly
devvy config set-model gpt-4o

# For custom providers, set the base URL
devvy config set-base-url https://your-api-endpoint.com/v1

# View current configuration
devvy config show
```

### Environment Variables

You can also use environment variables:

```bash
export OPENAI_API_KEY=your-key      # For OpenAI
export ANTHROPIC_API_KEY=your-key   # For Anthropic  
export OPENROUTER_API_KEY=your-key  # For OpenRouter
```

## Usage

### Start an interactive session

```bash
devvy chat
# or just
devvy
```

### Talk to specific agents

```
@coder Write a function to calculate fibonacci numbers
@critic Please review the code above
@debugger I'm getting an error: TypeError: undefined is not a function
@architect Design a REST API for a todo app
@enduser What questions would a user have about this feature?
```

### Special commands

```
@review        - Start a review cycle (Critic reviews, agents fix issues)
@brainstorm    - All agents collaborate on a topic

/model         - Select AI model (scrollable list with arrow keys)
/config        - Show current configuration
/clear         - Clear conversation history
/history       - Show conversation history
/help          - Show help
/exit          - Exit Devvy
```

## How It Works

1. **You describe a task** → The Architect provides a design
2. **The Coder implements** → Writes the code based on the design
3. **The Critic reviews** → Checks for bugs, security issues, best practices
4. **The End User evaluates** → Asks questions from a user perspective
5. **Iteration** → Agents discuss and fix issues until the code is approved

The unique aspect is that all agents can see the entire conversation and respond to each other, creating a more human-like collaborative discussion.

## Example Session

```
You> @architect Design a simple REST API for managing tasks

🏗️ [Architect]
I'll design a simple REST API for task management...
[provides architecture]

You> @coder Implement the API based on the architecture

💻 [Coder]
Here's the implementation...
[provides code]

You> @review

🔍 [Critic]
Reviewing the code...
NEEDS CHANGES: Missing error handling for invalid task IDs...

👤 [End User]
What happens if a user tries to update a task that doesn't exist?

💻 [Coder]
Good points! Here's the updated implementation with proper error handling...

🔍 [Critic]
APPROVED: The code now handles all edge cases properly.
```

## Context Management

Currently, all conversation history is kept in memory during a session. Future improvements may include:
- Persistent conversation storage
- Context window management for long conversations
- Summarization for older messages

## License

GPL-3.0 - See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
