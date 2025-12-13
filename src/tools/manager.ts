import { BaseTool, type ToolResult } from './base.js';
import { bashTool } from './bash.js';
import { writeFileTool } from './writeFile.js';
import { readFileTool } from './readFile.js';
import { editFileTool } from './editFile.js';
import { lspTool } from './lsp.js';
import { terminalUI } from '../cli/ui.js';

export class ToolManager {
  private tools: Map<string, BaseTool>;

  constructor() {
    this.tools = new Map();
    this.registerDefaultTools();
  }

  private registerDefaultTools(): void {
    this.registerTool(bashTool);
    this.registerTool(writeFileTool);
    this.registerTool(readFileTool);
    this.registerTool(editFileTool);
    this.registerTool(lspTool);
  }

  registerTool(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  async executeTool(
    toolName: string,
    args: Record<string, any>,
    showSpinner = true
  ): Promise<ToolResult> {
    const tool = this.getTool(toolName);

    if (!tool) {
      return {
        success: false,
        error: `Tool not found: ${toolName}`,
      };
    }

    try {
      if (showSpinner) {
        terminalUI.startSpinner(tool.spinnerText);
      }

      const result = await tool.execute(args);

      if (showSpinner) {
        terminalUI.stopSpinner(result.success, result.success ? 'Done' : 'Failed');
      }

      return result;
    } catch (error) {
      if (showSpinner) {
        terminalUI.stopSpinner(false, 'Failed');
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getCwd(): string {
    return process.cwd();
  }
}

export const toolManager = new ToolManager();
