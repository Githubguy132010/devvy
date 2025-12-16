import { describe, it, expect } from 'bun:test';
import { PROVIDER_CONFIG } from '../src/config/index.js';

describe('Gemini Provider Configuration', () => {
  it('should have Gemini in provider config', () => {
    expect(PROVIDER_CONFIG).toHaveProperty('gemini');
  });

  it('should have correct Gemini configuration', () => {
    const geminiConfig = PROVIDER_CONFIG.gemini;
    expect(geminiConfig.displayName).toBe('Google Gemini');
    expect(geminiConfig.envVar).toBe('GEMINI_API_KEY');
    expect(geminiConfig.defaultModel).toBe('gemini-2.0-flash-exp');
  });

  it('should not have a baseUrl for Gemini', () => {
    const geminiConfig = PROVIDER_CONFIG.gemini;
    expect(geminiConfig.baseUrl).toBeUndefined();
  });

  it('should have all expected providers', () => {
    const expectedProviders = ['openai', 'anthropic', 'openrouter', 'gemini', 'custom'];
    const actualProviders = Object.keys(PROVIDER_CONFIG);
    
    expect(actualProviders).toHaveLength(expectedProviders.length);
    expectedProviders.forEach(provider => {
      expect(actualProviders).toContain(provider);
    });
  });
});
