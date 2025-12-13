export interface ToolResult {
  success: boolean;
  output?: string;
  error?: string;
}

export interface ToolConfig {
  name: string;
  description: string;
  spinnerText: string;
}

export abstract class BaseTool {
  protected config: ToolConfig;

  constructor(config: ToolConfig) {
    this.config = config;
  }

  get name(): string {
    return this.config.name;
  }

  get description(): string {
    return this.config.description;
  }

  get spinnerText(): string {
    return this.config.spinnerText;
  }

  abstract execute(args: Record<string, any>): Promise<ToolResult>;

  formatResult(result: ToolResult): string {
    if (result.success) {
      return result.output || 'Success';
    } else {
      return `Error: ${result.error || 'Unknown error'}`;
    }
  }
}
