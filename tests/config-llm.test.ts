import { describe, it, expect, beforeEach, afterEach, jest, mock } from 'bun:test';
import { configManager, PROVIDER_CONFIG } from '../src/config/config.js';
import { validateConfig } from '../src/core/validation.js';
import { llmClient } from '../src/core/llm.js';
import { ConfigError } from '../src/core/errors.js';

// Mock console.error to suppress expected error logs during tests
global.console.error = jest.fn();

// Mock configManager to avoid validation issues during tests
mock.module('../src/config/index.js', () => ({
  configManager: {
    apiProvider: 'openai',
    apiKey: 'test-api-key-valid-format-12345',
    model: 'gpt-4o',
    apiBaseUrl: undefined,
    clearConfig: mock(() => {}),
    getAll: () => ({
      apiProvider: 'openai',
      apiKey: 'test-api-key-valid-format-12345',
      model: 'gpt-4o',
    }),
  },
}));

describe('Configuration Manager', () => {
  beforeEach(() => {
    // Reset config before each test
    configManager.clearConfig();
  });

  it('should have Gemini in PROVIDER_CONFIG', () => {
    expect(PROVIDER_CONFIG.gemini).toBeDefined();
    expect(PROVIDER_CONFIG.gemini.displayName).toBe('Gemini');
    expect(PROVIDER_CONFIG.gemini.defaultModel).toBe('gemini-3-pro-preview');
    expect(PROVIDER_CONFIG.gemini.envVar).toBe('GOOGLE_API_KEY');
    expect(PROVIDER_CONFIG.gemini.baseUrl).toBe('https://generativelanguage.googleapis.com/v1beta');
  });

  it('should accept gemini as valid provider', () => {
    const validation = validateConfig({
      apiKey: 'AIzaSyC1234567890abcdef1234567890abcdef',
      apiProvider: 'gemini',
      model: 'gemini-3-pro-preview',
    });
    expect(validation.isValid).toBe(true);
  });

  it('should reject invalid providers', () => {
    const validation = validateConfig({
      apiKey: 'test-key',
      apiProvider: 'invalid-provider' as any,
      model: 'test-model',
    });
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('apiProvider does not match required pattern');
  });

  it('should validate API key format for Gemini', () => {
    const validation = validateConfig({
      apiKey: 'AIzaSyC1234567890abcdef', // Google API key format
      apiProvider: 'gemini',
      model: 'gemini-3-pro-preview',
    });
    expect(validation.isValid).toBe(true);
  });
});

describe('LLM Client Provider Support', () => {
  beforeEach(() => {
    // Reset clients
    llmClient.resetClient();
  });

  it('should initialize OpenAI client for OpenAI provider', () => {
    configManager.apiProvider = 'openai';
    configManager.apiKey = 'test-key';

    // Access private method to test client initialization
    const openaiClient = (llmClient as any).getOpenAIClient();
    expect(openaiClient).toBeDefined();
  });

  it('should initialize Gemini client for Gemini provider', () => {
    configManager.apiProvider = 'gemini';
    configManager.apiKey = 'test-key';

    // Access private method to test client initialization
    const geminiClient = (llmClient as any).getGeminiClient();
    expect(geminiClient).toBeDefined();
  });

  it('should handle model fetching for different providers', async () => {
    // Mock the fetch implementation to avoid actual API calls
    const originalFetch = global.fetch;
    global.fetch = mock(async () => ({
      ok: true,
      json: async () => ({
        models: [
          { name: 'models/gemini-1.5-flash' },
          { name: 'models/gemini-3-pro-preview' },
        ]
      })
    })) as any;

    try {
      configManager.apiProvider = 'gemini';
      configManager.apiKey = 'test-key';

      // Mock the Gemini client methods
      const mockGeminiClient = {
        models: {
          list: mock(() => Promise.resolve({
            models: [
              { name: 'models/gemini-1.5-flash' },
              { name: 'models/gemini-3-pro-preview' },
            ]
          }))
        }
      };

      // Replace the client temporarily
      (llmClient as any).geminiClient = mockGeminiClient;

      const models = await llmClient.fetchModels();

      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);

      // Check that models are properly formatted
      const geminiModel = models.find(m => m.id === 'gemini-3-pro-preview');
      expect(geminiModel).toBeDefined();
      expect(geminiModel?.owned_by).toBe('google');

    } finally {
      global.fetch = originalFetch;
    }
  });

  it('should format messages for Gemini correctly', () => {
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello!' },
      { role: 'assistant', content: 'Hi there!' },
    ];

    const formatted = (llmClient as any).formatMessagesForGemini(messages);

    expect(formatted).toBeDefined();
    expect(Array.isArray(formatted)).toBe(true);
    expect(formatted.length).toBe(3);

    // Check system message conversion (system becomes user in Gemini)
    expect(formatted[0].role).toBe('user');
    expect(formatted[0].parts[0].text).toBe('You are a helpful assistant.');

    // Check user message
    expect(formatted[1].role).toBe('user');
    expect(formatted[1].parts[0].text).toBe('Hello!');

    // Check assistant message
    expect(formatted[2].role).toBe('model');
    expect(formatted[2].parts[0].text).toBe('Hi there!');
  });

  it('should handle tool calls in Gemini message formatting', () => {
    const messages = [
      {
        role: 'assistant',
        content: 'I need to check the file.',
        tool_calls: [{
          id: 'call_123',
          type: 'function',
          function: {
            name: 'read_file',
            arguments: '{"path": "test.txt"}',
          },
        }],
      },
      {
        role: 'tool',
        content: 'File contents',
        tool_call_id: 'read_file',
      },
    ];

    const formatted = (llmClient as any).formatMessagesForGemini(messages);

    expect(formatted).toBeDefined();
    expect(formatted.length).toBe(2);

    // Check function call formatting
    expect(formatted[0].parts).toContainEqual({
      functionCall: {
        name: 'read_file',
        args: { path: 'test.txt' },
      },
    });

    // Check tool response formatting
    expect(formatted[1].parts).toContainEqual({
      functionResponse: {
        name: 'read_file',
        response: { content: 'File contents' },
      },
    });
  });
});

describe('Provider-Specific Error Handling', () => {
  beforeEach(() => {
    llmClient.resetClient();
  });

  it('should throw ConfigError when API key is missing for Gemini', () => {
    configManager.apiProvider = 'gemini';
    configManager.apiKey = undefined;

    expect(() => (llmClient as any).getGeminiClient()).toThrow(ConfigError);
  });

  it('should throw ConfigError when API key is missing for OpenAI', () => {
    configManager.apiProvider = 'openai';
    configManager.apiKey = undefined;

    expect(() => (llmClient as any).getOpenAIClient()).toThrow(ConfigError);
  });
});