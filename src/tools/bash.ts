import { spawn } from 'child_process';
import { BaseTool, type ToolResult } from './base.js';

export class BashTool extends BaseTool {
    readonly name = 'bash';
    readonly description = 'Execute a bash command in the current working directory. Returns stdout and stderr.';
    readonly parameters = {
        type: 'object' as const,
        properties: {
            command: {
                type: 'string',
                description: 'The bash command to execute',
            },
            cwd: {
                type: 'string',
                description: 'Working directory for the command (optional, defaults to current directory)',
            },
            timeout: {
                type: 'number',
                description: 'Timeout in milliseconds (optional, defaults to 30000)',
            },
        },
        required: ['command'],
    };

    async execute(args: Record<string, unknown>): Promise<ToolResult> {
        const command = args.command as string;
        const cwd = (args.cwd as string) || process.cwd();
        const timeout = (args.timeout as number) || 30000;

        return new Promise((resolve) => {
            let stdout = '';
            let stderr = '';
            let killed = false;

            const child = spawn('bash', ['-c', command], {
                cwd,
                env: process.env,
            });

            const timer = setTimeout(() => {
                killed = true;
                child.kill('SIGTERM');
            }, timeout);

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                clearTimeout(timer);

                if (killed) {
                    resolve({
                        success: false,
                        error: `Command timed out after ${timeout}ms`,
                        output: stdout + stderr,
                    });
                    return;
                }

                if (code === 0) {
                    resolve({
                        success: true,
                        output: stdout || stderr || '(no output)',
                    });
                } else {
                    resolve({
                        success: false,
                        error: `Command exited with code ${code}`,
                        output: stderr || stdout,
                    });
                }
            });

            child.on('error', (error) => {
                clearTimeout(timer);
                resolve({
                    success: false,
                    error: error.message,
                });
            });
        });
    }
}

export const bashTool = new BashTool();
