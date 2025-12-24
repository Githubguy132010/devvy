# Devvy - AI Chat Desktop Application

Devvy is a powerful desktop AI chat application built with Tauri, React, and TypeScript. It features a glassmorphism-styled interface with support for multiple major LLM providers.

## Features

- 🤖 **Multiple LLM Providers**: Support for OpenAI, Anthropic (Claude), Google (Gemini), and Ollama (local models)
- 💬 **Rich Chat Interface**: Glassmorphism design with message branching and code highlighting
- 🔒 **Privacy-Focused**: All API keys stored locally on your machine
- 🎨 **Modern UI**: Beautiful glassmorphism design with smooth animations
- 📝 **Markdown Support**: Full markdown rendering with syntax highlighting
- 🌿 **Message Branching**: Create alternative conversation branches
- 📋 **Code Panel**: Separate panel for viewing and copying code snippets
- 🔄 **Message Regeneration**: Regenerate AI responses with one click

## Supported LLM Providers

### OpenAI
- Models: GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-4, GPT-3.5-turbo
- Get API key: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Anthropic (Claude)
- Models: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- Get API key: [console.anthropic.com](https://console.anthropic.com/)

### Google (Gemini)
- Models: Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 1.0 Pro
- Get API key: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### Ollama (Local Models)
- Models: Llama 3.2, Llama 3.1, Mistral, Mixtral, CodeLlama, Phi3, Qwen2.5, and more
- Install: [ollama.ai](https://ollama.ai/)
- No API key required - runs completely locally

### Custom (OpenAI-Compatible)
- Compatible with any OpenAI-compatible API:
  - **LM Studio** - Run models locally with a simple UI
  - **LocalAI** - Self-hosted OpenAI alternative
  - **vLLM** - High-throughput inference server
  - **Text Generation WebUI** - Popular model hosting
  - **Jan** - Local AI assistant
  - Any other OpenAI-compatible endpoint
- Requires: API base URL and API key
- Supports: Any model name

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Rust 1.70+
- Tauri system dependencies (see below)

### System Dependencies

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libjavascriptcoregtk-4.1-dev
```

#### macOS
```bash
# No additional dependencies needed
```

#### Windows
```bash
# No additional dependencies needed
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Githubguy132010/devvy.git
cd devvy
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Configure your LLM provider (optional):
```bash
cp .env.example .env
# Edit .env and add your API keys
```

### Development

Run the development server:
```bash
npm run tauri dev
# or
bun run tauri dev
```

### Building

Build the application:
```bash
npm run tauri build
# or
bun run tauri build
```

## Configuration

### Setting up LLM Providers

1. Launch the application
2. Click the Settings icon in the sidebar
3. Select your preferred LLM provider
4. Enter your API key (not required for Ollama)
5. (Optional) Customize model, temperature, and max tokens
6. Start chatting!

### Provider-Specific Setup

#### Ollama Setup
1. Install Ollama from [ollama.ai](https://ollama.ai/)
2. Pull a model: `ollama pull llama3.2`
3. Ensure Ollama is running: `ollama serve`
4. Select "Ollama (Local)" in Devvy settings
5. Start chatting with local models!

## Project Structure

```
devvy/
├── src/                    # React TypeScript frontend
│   ├── components/        # React components
│   │   ├── chat/         # Chat-related components
│   │   ├── common/       # Reusable components
│   │   ├── dialogs/      # Dialog components
│   │   └── layout/       # Layout components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Service layers (LLM service)
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── App.tsx           # Main application component
├── src-tauri/             # Rust backend
│   └── src/
│       ├── llm.rs        # LLM provider implementations
│       ├── lib.rs        # Tauri application setup
│       └── main.rs       # Application entry point
└── public/                # Static assets
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7
- **Backend**: Rust, Tauri 2
- **UI**: Framer Motion (animations), CSS3 (glassmorphism)
- **Markdown**: react-markdown, react-syntax-highlighter
- **HTTP Client**: reqwest (Rust), @tauri-apps/api (TypeScript)

## Development Commands

```bash
npm run dev              # Start Vite dev server
npm run build            # TypeScript compile + Vite build
npm run preview          # Preview production build
npm run tauri dev        # Run Tauri app in dev mode
npm run tauri build      # Build Tauri desktop app
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Privacy & Security

- All API keys are stored locally on your machine
- No telemetry or analytics are collected
- API calls are made directly to the provider you choose
- For maximum privacy, use Ollama with local models
