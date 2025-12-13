import { readFile, writeFile } from 'fs/promises';
import { BaseTool, type ToolResult } from './base.js';

export class EditFileTool extends BaseTool {
  constructor() {
    super({
      name: 'editFile',
      description: 'Edit a file by replacing content',
      spinnerText: 'Editing file...',
    });
  }

  async execute(args: {
    path: string;
    oldContent: string;
    newContent: string;
  }): Promise<ToolResult> {
    try {
      const { path, oldContent, newContent } = args;

      if (!path) {
        return {
          success: false,
          error: 'File path is required',
        };
      }

      if (!oldContent) {
        return {
          success: false,
          error: 'Old content to replace is required',
        };
      }

      // Read current content
      const currentContent = await readFile(path, 'utf-8');

      // Check if old content exists
      if (!currentContent.includes(oldContent)) {
        return {
          success: false,
          error: 'Old content not found in file',
        };
      }

      // Replace content
      const updatedContent = currentContent.replace(oldContent, newContent);

      // Write updated content
      await writeFile(path, updatedContent, 'utf-8');

      return {
        success: true,
        output: `File edited successfully: ${path}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const editFileTool = new EditFileTool();
