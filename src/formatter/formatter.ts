import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface FormatterConfig {
    command: string;
    args: string[];
    extension: string;
}

const FORMATTERS: Record<string, FormatterConfig> = {
    javascript: { command: 'prettier', args: ['--parser', 'babel', '--stdin-filepath', 'code.js'], extension: 'js' },
    typescript: { command: 'prettier', args: ['--parser', 'typescript', '--stdin-filepath', 'code.ts'], extension: 'ts' },
    json: { command: 'prettier', args: ['--parser', 'json', '--stdin-filepath', 'code.json'], extension: 'json' },
    css: { command: 'prettier', args: ['--parser', 'css', '--stdin-filepath', 'code.css'], extension: 'css' },
    html: { command: 'prettier', args: ['--parser', 'html', '--stdin-filepath', 'code.html'], extension: 'html' },
    markdown: { command: 'prettier', args: ['--parser', 'markdown', '--stdin-filepath', 'code.md'], extension: 'md' },
    yaml: { command: 'prettier', args: ['--parser', 'yaml', '--stdin-filepath', 'code.yaml'], extension: 'yaml' },
    python: { command: 'black', args: ['-', '-q'], extension: 'py' },
    go: { command: 'gofmt', args: [], extension: 'go' },
    rust: { command: 'rustfmt', args: [], extension: 'rs' },
};

// Map common language aliases
const LANGUAGE_ALIASES: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    py: 'python',
    yml: 'yaml',
    md: 'markdown',
};

export class CodeFormatter {
    /**
     * Find a formatter binary in node_modules or system PATH
     */
    private findFormatter(cwd: string, command: string): string | null {
        // Check node_modules/.bin first
        const nodeModulesBin = join(cwd, 'node_modules', '.bin', command);
        if (existsSync(nodeModulesBin)) {
            return nodeModulesBin;
        }

        // Check parent directories for node_modules
        let dir = cwd;
        for (let i = 0; i < 5; i++) {
            const parentBin = join(dir, 'node_modules', '.bin', command);
            if (existsSync(parentBin)) {
                return parentBin;
            }
            const parent = join(dir, '..');
            if (parent === dir) break;
            dir = parent;
        }

        // Return command name to use from PATH
        return command;
    }

    /**
     * Format a code snippet
     */
    async format(code: string, language: string, cwd = process.cwd()): Promise<string> {
        const normalizedLang = LANGUAGE_ALIASES[language.toLowerCase()] || language.toLowerCase();
        const config = FORMATTERS[normalizedLang];

        if (!config) {
            // No formatter configured for this language
            return code;
        }

        const formatterPath = this.findFormatter(cwd, config.command);
        if (!formatterPath) {
            return code;
        }

        return new Promise((resolve) => {
            try {
                const child = spawn(formatterPath, config.args, {
                    cwd,
                    env: process.env,
                    stdio: ['pipe', 'pipe', 'pipe'],
                });

                let stdout = '';
                let stderr = '';

                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });

                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                child.on('close', (exitCode) => {
                    if (exitCode === 0 && stdout) {
                        resolve(stdout);
                    } else {
                        // If formatting fails, return original code
                        resolve(code);
                    }
                });

                child.on('error', () => {
                    // Formatter not found or failed to start
                    resolve(code);
                });

                // Write code to stdin
                child.stdin.write(code);
                child.stdin.end();

                // Timeout after 5 seconds
                setTimeout(() => {
                    child.kill();
                    resolve(code);
                }, 5000);
            } catch {
                resolve(code);
            }
        });
    }

    /**
     * Format all code blocks in a response
     */
    async formatResponse(response: string, cwd = process.cwd()): Promise<string> {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const matches = [...response.matchAll(codeBlockRegex)];

        if (matches.length === 0) {
            return response;
        }

        let result = response;

        for (const match of matches) {
            const [fullMatch, language, code] = match;
      if (language && code && !fullMatch.includes('hljs')) {
                const formattedCode = await this.format(code.trim(), language, cwd);
                const formattedBlock = `\`\`\`${language}\n${formattedCode}\n\`\`\``;
                result = result.replace(fullMatch, formattedBlock);
            }
        }

        return result;
    }
}

export const codeFormatter = new CodeFormatter();
