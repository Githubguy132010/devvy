import { exec } from 'child_process';
import { promisify } from 'util';
import { BaseTool, type ToolResult } from './base.js';

const execAsync = promisify(exec);

export class BashTool extends BaseTool {
  constructor() {
    super({
      name: 'bash',
      description: 'Execute shell commands',
      spinnerText: 'Executing command...',
    });
  }

  async execute(args: { command: string; cwd?: string }): Promise<ToolResult> {
    try {
      const { command, cwd } = args;

      if (!command) {
        return {
          success: false,
          error: 'Command is required',
        };
      }

      const options = cwd ? { cwd } : { cwd: process.cwd() };
      const { stdout, stderr } = await execAsync(command, options);

      return {
        success: true,
        output: `${stdout}${stderr ? `\nStderr: ${stderr}` : ''}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const bashTool = new BashTool();
