# Settings UI - Visual Changes

## Provider Selection with Icons

The Settings page now displays provider icons for better visual identification:

```
┌─────────────────────────────────────────────┐
│  Settings                                   │
├─────────────────────────────────────────────┤
│                                             │
│  LLM Provider                               │
│                                             │
│  Provider                                   │
│  ┌───────────────────────────────────────┐ │
│  │ Custom (OpenAI Compatible)        ▼  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [🔧]  Custom (OpenAI Compatible)          │
│  ↑ Provider icon shown here                │
│                                             │
│  API Key                                    │
│  ┌───────────────────────────────────────┐ │
│  │ ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Model                                      │
│  ┌───────────────────────────────────────┐ │
│  │ mistral-7b-instruct              │ │ │ │
│  └───────────────────────────────────────┘ │
│  ↑ Text input for custom models            │
│                                             │
│  Temperature (0-2)                          │
│  ┌───────────────────────────────────────┐ │
│  │ 0.7                                   │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Max Tokens                                 │
│  ┌───────────────────────────────────────┐ │
│  │ 4096                                  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  API Base URL                               │
│  ┌───────────────────────────────────────┐ │
│  │ http://localhost:1234/v1              │ │
│  └───────────────────────────────────────┘ │
│  For OpenAI-compatible APIs (e.g., LM      │
│  Studio, LocalAI, vLLM, etc.)              │
│                                             │
└─────────────────────────────────────────────┘
```

## Provider Icons

Each provider has a unique SVG icon displayed in the Settings:

- **OpenAI**: OpenAI logo (atom-like symbol)
- **Anthropic**: Anthropic logo (wave pattern)
- **Google**: Google Gemini logo (colorful circles)
- **Ollama**: Server/terminal icon
- **Custom**: Wrench/tools icon

## Dropdown Options

When you click the Provider dropdown, you'll see:

```
┌─────────────────────────────────┐
│ OpenAI                          │
│ Anthropic (Claude)              │
│ Google (Gemini)                 │
│ Ollama (Local)                  │
│ Custom (OpenAI Compatible)   ✓  │
└─────────────────────────────────┘
```

## Dynamic Fields

Fields shown/hidden based on provider:

- **API Key**: Shown for all except Ollama
- **Model**: Dropdown for standard providers, text input for Custom
- **Base URL**: Shown for Ollama and Custom
- **Temperature & Max Tokens**: Always shown

## Example Configurations

### LM Studio (Custom Provider)
- Provider: Custom (OpenAI Compatible)
- API Key: lm-studio (or any value)
- Model: mistral-7b-instruct-v0.2
- API Base URL: http://localhost:1234/v1

### OpenRouter (Custom Provider)
- Provider: Custom (OpenAI Compatible)
- API Key: sk-or-v1-***
- Model: anthropic/claude-3.5-sonnet
- API Base URL: https://openrouter.ai/api/v1

### Together AI (Custom Provider)
- Provider: Custom (OpenAI Compatible)
- API Key: ***
- Model: meta-llama/Llama-3-70b-chat-hf
- API Base URL: https://api.together.xyz/v1
