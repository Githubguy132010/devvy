import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { BaseTool, type ToolResult } from './base.js';

export class WriteFileTool extends BaseTool {
  constructor() {
    super({
      name: 'writeFile',
      description: 'Write content to a file',
      spinnerText: 'Writing file...',
    });
  }

  async execute(args: { path: string; content: string; createDirs?: boolean }): Promise<ToolResult> {
    try {
      const { path, content, createDirs = true } = args;

      if (!path) {
        return {
          success: false,
          error: 'File path is required',
        };
      }

      if (content === undefined) {
        return {
          success: false,
          error: 'Content is required',
        };
      }

      // Create parent directories if needed
      if (createDirs) {
        const dir = dirname(path);
        await mkdir(dir, { recursive: true });
      }

      await writeFile(path, content, 'utf-8');

      return {
        success: true,
        output: `File written successfully: ${path}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const writeFileTool = new WriteFileTool();
