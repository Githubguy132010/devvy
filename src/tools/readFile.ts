import { readFile } from 'fs/promises';
import { BaseTool, type ToolResult } from './base.js';

export class ReadFileTool extends BaseTool {
  constructor() {
    super({
      name: 'readFile',
      description: 'Read content from a file',
      spinnerText: 'Reading file...',
    });
  }

  async execute(args: { path: string }): Promise<ToolResult> {
    try {
      const { path } = args;

      if (!path) {
        return {
          success: false,
          error: 'File path is required',
        };
      }

      const content = await readFile(path, 'utf-8');

      return {
        success: true,
        output: content,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const readFileTool = new ReadFileTool();
