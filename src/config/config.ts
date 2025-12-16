import Conf from 'conf';
import * as readline from 'readline';

export type ApiProvider = 'openai' | 'anthropic' | 'openrouter' | 'gemini' | 'custom';

interface DevvyConfig {
  apiKey?: string;
  apiProvider: ApiProvider;
  apiBaseUrl?: string;
  model: string;
  setupComplete?: boolean;
}

const defaultConfig: DevvyConfig = {
  apiProvider: 'openai',
  model: 'gpt-4o',
  setupComplete: false,
};

// Provider configurations
export const PROVIDER_CONFIG: Record<ApiProvider, { baseUrl?: string; defaultModel: string; envVar: string; displayName: string }> = {
  openai: {
    defaultModel: 'gpt-4o',
    envVar: 'OPENAI_API_KEY',
    displayName: 'OpenAI',
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    envVar: 'ANTHROPIC_API_KEY',
    displayName: 'Anthropic',
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    envVar: 'OPENROUTER_API_KEY',
    displayName: 'OpenRouter',
  },
  gemini: {
    defaultModel: 'gemini-2.0-flash-exp',
    envVar: 'GEMINI_API_KEY',
    displayName: 'Google Gemini',
  },
  custom: {
    defaultModel: 'gpt-4o',
    envVar: 'API_KEY',
    displayName: 'Custom Provider',
  },
};

class ConfigManager {
  private config: Conf<DevvyConfig>;

  constructor() {
    this.config = new Conf<DevvyConfig>({
      projectName: 'devvy',
      defaults: defaultConfig,
    });
  }

  get apiKey(): string | undefined {
    // Check environment variables based on provider first
    const provider = this.apiProvider;
    const envVar = PROVIDER_CONFIG[provider].envVar;
    if (process.env[envVar]) {
      return process.env[envVar];
    }
    
    // Fall back to checking all provider env vars
    for (const config of Object.values(PROVIDER_CONFIG)) {
      if (process.env[config.envVar]) {
        return process.env[config.envVar];
      }
    }
    
    // Finally check stored config
    return this.config.get('apiKey');
  }

  set apiKey(key: string | undefined) {
    this.config.set('apiKey', key);
  }

  get apiProvider(): ApiProvider {
    return this.config.get('apiProvider');
  }

  set apiProvider(provider: ApiProvider) {
    this.config.set('apiProvider', provider);
  }

  get apiBaseUrl(): string | undefined {
    // Return configured URL or provider default
    const configuredUrl = this.config.get('apiBaseUrl');
    if (configuredUrl) return configuredUrl;
    
    const providerConfig = PROVIDER_CONFIG[this.apiProvider];
    return providerConfig.baseUrl;
  }

  set apiBaseUrl(url: string | undefined) {
    this.config.set('apiBaseUrl', url);
  }

  get model(): string {
    return this.config.get('model');
  }

  set model(model: string) {
    this.config.set('model', model);
  }

  get setupComplete(): boolean {
    return this.config.get('setupComplete') || false;
  }

  set setupComplete(complete: boolean) {
    this.config.set('setupComplete', complete);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  isFirstRun(): boolean {
    return !this.setupComplete && !this.hasApiKey();
  }

  async promptForApiKey(): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question('Enter your API key: ', (answer) => {
        rl.close();
        this.apiKey = answer.trim();
        resolve(answer.trim());
      });
    });
  }

  clearConfig(): void {
    this.config.clear();
  }

  getAll(): DevvyConfig {
    return {
      apiKey: this.apiKey ? '***hidden***' : undefined,
      apiProvider: this.apiProvider,
      apiBaseUrl: this.apiBaseUrl,
      model: this.model,
      setupComplete: this.setupComplete,
    };
  }

  getProviderConfig(provider?: ApiProvider) {
    return PROVIDER_CONFIG[provider || this.apiProvider];
  }
}

export const configManager = new ConfigManager();
export type { DevvyConfig };
