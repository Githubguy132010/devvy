import Conf from 'conf';
import * as readline from 'readline';

interface DevvyConfig {
  apiKey?: string;
  apiProvider: 'openai' | 'anthropic' | 'custom';
  apiBaseUrl?: string;
  model: string;
}

const defaultConfig: DevvyConfig = {
  apiProvider: 'openai',
  model: 'gpt-4o',
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
    return process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || this.config.get('apiKey');
  }

  set apiKey(key: string | undefined) {
    this.config.set('apiKey', key);
  }

  get apiProvider(): 'openai' | 'anthropic' | 'custom' {
    return this.config.get('apiProvider');
  }

  set apiProvider(provider: 'openai' | 'anthropic' | 'custom') {
    this.config.set('apiProvider', provider);
  }

  get apiBaseUrl(): string | undefined {
    return this.config.get('apiBaseUrl');
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

  hasApiKey(): boolean {
    return !!this.apiKey;
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
    };
  }
}

export const configManager = new ConfigManager();
export type { DevvyConfig };
