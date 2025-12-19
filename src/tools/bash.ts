import { spawn } from 'child_process';
import { BaseTool, type ToolResult } from './base.js';
import { validateBashCommand, requireValid } from '../core/validation.js';

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

        // Input validation and security checks
        const validation = validateBashCommand(command);
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.errors.join(', '),
            };
        }

        return new Promise((resolve) => {
            let stdout = '';
            let stderr = '';
            let killed = false;
            let child: ReturnType<typeof spawn> | null = null;

            try {
                child = spawn('bash', ['-c', command], {
                    cwd,
                    env: { ...process.env, PATH: process.env.PATH },
                    stdio: ['pipe', 'pipe', 'pipe'],
                    detached: false,
                });
            } catch (error) {
                resolve({
                    success: false,
                    error: `Failed to spawn command: ${error instanceof Error ? error.message : String(error)}`,
                });
                return;
            }

            const timer = setTimeout(() => {
                if (!child) return;
                
                killed = true;
                try {
                    // Try graceful termination first
                    child.kill('SIGTERM');
                    
                    // Force kill after 5 seconds
                    setTimeout(() => {
                        if (child && !child.killed) {
                            child.kill('SIGKILL');
                        }
                    }, 5000);
                } catch (error) {
                    // Ignore kill errors
                }
            }, timeout);

            const cleanup = () => {
                clearTimeout(timer);
                child?.removeAllListeners();
            };

            child.stdout?.on('data', (data) => {
                stdout += data.toString();
                // Limit output size to prevent memory issues
                if (stdout.length > 1000000) { // 1MB limit
                    child?.kill('SIGTERM');
                    cleanup();
                    resolve({
                        success: false,
                        error: 'Output too large (>1MB)',
                        output: stdout,
                    });
                }
            });

            child.stderr?.on('data', (data) => {
                stderr += data.toString();
                // Limit stderr size as well
                if (stderr.length > 1000000) {
                    child?.kill('SIGTERM');
                    cleanup();
                    resolve({
                        success: false,
                        error: 'Error output too large (>1MB)',
                        output: stdout + stderr,
                    });
                }
            });

            child.on('close', (code, signal) => {
                cleanup();

                if (killed) {
                    resolve({
                        success: false,
                        error: signal === 'SIGTERM' 
                            ? `Command timed out after ${timeout}ms`
                            : `Command killed with signal ${signal}`,
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
                cleanup();
                resolve({
                    success: false,
                    error: error.message,
                });
            });
        });
    }
}

export const bashTool = new BashTool();
