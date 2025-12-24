# LLM Provider Setup Guide

This guide will help you set up and configure different LLM providers in Devvy.

## Quick Start

1. Launch Devvy
2. Click the **Settings** icon (⚙️) in the sidebar
3. Select your preferred provider from the dropdown
4. Enter your API key (if required)
5. (Optional) Customize model and parameters
6. Return to chat and start conversations!

## Provider-Specific Guides

### OpenAI Setup

1. **Get an API Key:**
   - Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Sign in or create an account
   - Click "Create new secret key"
   - Copy your API key

2. **Configure Devvy:**
   - Open Settings
   - Select "OpenAI" as provider
   - Paste your API key
   - Choose a model (default: gpt-4o)
   - Adjust temperature (0-2, default: 0.7) for response randomness
   - Set max tokens if needed (default: 4096)

3. **Models Available:**
   - `gpt-4o` - Latest and most capable model
   - `gpt-4o-mini` - Faster, more affordable
   - `gpt-4-turbo` - Previous generation flagship
   - `gpt-4` - Original GPT-4
   - `gpt-3.5-turbo` - Fast and economical

### Anthropic (Claude) Setup

1. **Get an API Key:**
   - Visit [console.anthropic.com](https://console.anthropic.com/)
   - Sign in or create an account
   - Go to API Keys section
   - Generate a new API key

2. **Configure Devvy:**
   - Open Settings
   - Select "Anthropic (Claude)" as provider
   - Paste your API key
   - Choose a model (default: claude-3-5-sonnet-20241022)
   - Adjust parameters as needed

3. **Models Available:**
   - `claude-3-5-sonnet-20241022` - Best overall model
   - `claude-3-5-haiku-20241022` - Fast and efficient
   - `claude-3-opus-20240229` - Most capable (higher cost)
   - `claude-3-sonnet-20240229` - Balanced performance
   - `claude-3-haiku-20240307` - Fast responses

### Google (Gemini) Setup

1. **Get an API Key:**
   - Visit [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key

2. **Configure Devvy:**
   - Open Settings
   - Select "Google (Gemini)" as provider
   - Paste your API key
   - Choose a model (default: gemini-2.0-flash-exp)
   - Adjust parameters as needed

3. **Models Available:**
   - `gemini-2.0-flash-exp` - Latest experimental model
   - `gemini-1.5-pro` - Most capable model
   - `gemini-1.5-flash` - Fast and efficient
   - `gemini-1.0-pro` - Original model

### Ollama (Local Models) Setup

1. **Install Ollama:**
   - Visit [ollama.ai](https://ollama.ai/)
   - Download for your platform (macOS, Linux, or Windows)
   - Follow installation instructions

2. **Pull a Model:**
   ```bash
   # Pull Llama 3.2 (recommended for most users)
   ollama pull llama3.2
   
   # Or try other models
   ollama pull mistral
   ollama pull codellama
   ollama pull phi3
   ```

3. **Start Ollama Service:**
   ```bash
   ollama serve
   ```

4. **Configure Devvy:**
   - Open Settings
   - Select "Ollama (Local)" as provider
   - No API key needed!
   - Choose a model from the dropdown
   - (Optional) Set custom base URL if not using default
   - Adjust parameters as needed

5. **Available Models:**
   - `llama3.2` - Latest Llama model
   - `llama3.1` - Previous Llama version
   - `mistral` - Efficient 7B model
   - `mixtral` - Mixture of experts model
   - `codellama` - Specialized for coding
   - `phi3` - Microsoft's small but capable model
   - `qwen2.5` - Alibaba's language model

6. **Benefits:**
   - ✅ No API key required
   - ✅ No internet required after download
   - ✅ Complete privacy - data never leaves your machine
   - ✅ No per-request costs
   - ✅ Faster responses (no network latency)

## Configuration Parameters

### Temperature
- **Range:** 0.0 - 2.0
- **Default:** 0.7
- **Lower values** (0.0-0.3): More focused and deterministic
- **Medium values** (0.4-0.9): Balanced creativity and coherence
- **Higher values** (1.0-2.0): More creative and random

### Max Tokens
- **Default:** 4096
- Controls the maximum length of the response
- Higher values allow longer responses but may cost more (for paid APIs)

### Base URL (Ollama only)
- **Default:** http://localhost:11434
- Change this if Ollama is running on a different host or port

## Troubleshooting

### "Failed to get response from..."
- **Check API key:** Ensure it's entered correctly
- **Check internet:** API-based providers need internet access
- **Check balance:** Ensure your API account has credits (OpenAI, Anthropic, Google)
- **Check Ollama:** Ensure `ollama serve` is running (Ollama only)

### "No response from provider"
- The provider might be experiencing downtime
- Check the provider's status page
- Try a different model

### "Model not found" (Ollama)
- Pull the model first: `ollama pull <model-name>`
- List available models: `ollama list`

### Slow Responses (Ollama)
- Local models depend on your hardware
- Consider using smaller models (e.g., phi3 instead of llama3.2)
- Ensure no other heavy processes are running

## Privacy & Security

### API-based Providers (OpenAI, Anthropic, Google)
- Your messages are sent to the provider's servers
- API keys are stored locally on your machine
- Never share your API keys
- Review each provider's privacy policy

### Ollama (Local)
- All processing happens on your machine
- No data is sent to external servers
- Complete privacy and control
- Best choice for sensitive data

## Cost Considerations

### Free/Low-Cost Options
- **Ollama:** Completely free (requires local hardware)
- **OpenAI gpt-3.5-turbo:** Low cost per request
- **Google Gemini:** Generous free tier

### Premium Options
- **OpenAI gpt-4o:** Higher quality, higher cost
- **Anthropic Claude:** High quality, moderate cost
- **Google Gemini Pro:** High quality, moderate cost

## Best Practices

1. **Start with the default model** for your chosen provider
2. **Use lower temperature** (0.3-0.5) for factual tasks
3. **Use higher temperature** (0.8-1.2) for creative writing
4. **Keep max tokens reasonable** to control costs
5. **Use Ollama** for privacy-sensitive conversations
6. **Try multiple providers** to find what works best for you

## Getting Help

If you encounter issues:
1. Check this guide
2. Review the README.md
3. Check the GitHub issues
4. Open a new issue with details about your problem
