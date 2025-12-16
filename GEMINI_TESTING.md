# Manual Testing Guide for Gemini API Integration

This guide explains how to manually test the Gemini API integration in Devvy.

## Prerequisites

1. Get a Gemini API key from: https://aistudio.google.com/apikey
2. Have Node.js 18+ or Bun installed

## Setup Method 1: Interactive Setup Wizard

```bash
# Run the interactive setup
npm start

# Or if using the built CLI
node dist/index.js
```

When prompted:
1. Select option `4` for Google Gemini
2. Enter your Gemini API key
3. Choose your default model (or press Enter for `gemini-2.0-flash-exp`)

## Setup Method 2: Manual Configuration

```bash
# Set the provider
node dist/index.js config set-provider gemini

# Set your API key
node dist/index.js config set-key YOUR_GEMINI_API_KEY

# Set the model (optional, defaults to gemini-2.0-flash-exp)
node dist/index.js config set-model gemini-2.0-flash-exp
```

## Setup Method 3: Environment Variable

```bash
# Set the environment variable
export GEMINI_API_KEY=your_api_key_here

# Run Devvy
npm start
```

## Testing the Integration

### 1. Test Basic Chat

```bash
npm start
```

Then type a message to chat with the Coder agent:
```
Write a hello world function in Python
```

### 2. Test Agent Commands

```
@architect Design a simple REST API
@coder Implement the API
@critic Review the code
```

### 3. Test Model Selection

Type in the interactive session:
```
/model
```

This should show available Gemini models including:
- gemini-2.0-flash-exp
- gemini-1.5-pro
- gemini-1.5-flash

### 4. Test Tool Calling

Ask the Coder to create a file:
```
@coder Create a simple README.md file with project information
```

The Gemini API should use the write_file tool to create the file.

### 5. Test Streaming

All responses should stream in real-time as the model generates them.

### 6. View Configuration

Type in the interactive session:
```
/config
```

You should see:
- Provider: gemini
- Model: gemini-2.0-flash-exp (or your selected model)

## Expected Behavior

✅ **Success indicators:**
- Messages stream in real-time
- Tool calls execute correctly (file operations, etc.)
- All agent commands work (@coder, @critic, @debugger, @architect, @enduser)
- Model selection shows Gemini models
- Configuration displays correct provider and model

⚠️ **Known limitations:**
- Some advanced tool features may vary compared to OpenAI
- Token usage tracking may differ in format

## Troubleshooting

### "API key not configured"
- Ensure you've set the GEMINI_API_KEY environment variable or configured it via setup
- Run: `node dist/index.js config show` to verify configuration

### "Failed to fetch models"
- Check your API key is valid
- Verify internet connectivity
- Try the API key at: https://aistudio.google.com/

### TypeScript/Build errors
- Run: `npm run build` to rebuild the project
- Check Node.js version: `node --version` (should be 18+)

## Reverting to Another Provider

To switch back to OpenAI or another provider:

```bash
# Interactive setup
npm start
# Then run: /exit and restart with: devvy setup

# Or manual:
node dist/index.js config set-provider openai
node dist/index.js config set-key YOUR_OPENAI_KEY
```

## Feedback and Issues

If you encounter any issues with the Gemini integration, please report them with:
1. The command you ran
2. The error message (if any)
3. Your Node.js version
4. The model you're using
