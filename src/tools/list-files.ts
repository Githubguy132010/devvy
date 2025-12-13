import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { BaseTool, type ToolResult } from './base.js';

interface FileEntry {
    name: string;
    path: string;
    type: 'file' | 'directory';
    size?: number;
}

export class ListFilesTool extends BaseTool {
    readonly name = 'list_files';
    readonly description = 'List files and directories in a given path.';
    readonly parameters = {
        type: 'object' as const,
        properties: {
            path: {
                type: 'string',
                description: 'The directory path to list (optional, defaults to current directory)',
            },
            recursive: {
                type: 'boolean',
                description: 'Whether to list recursively (optional, defaults to false)',
            },
            maxDepth: {
                type: 'number',
                description: 'Maximum recursion depth (optional, defaults to 3)',
            },
        },
        required: [],
    };

    async execute(args: Record<string, unknown>): Promise<ToolResult> {
        const basePath = (args.path as string) || process.cwd();
        const recursive = (args.recursive as boolean) || false;
        const maxDepth = (args.maxDepth as number) || 3;

        try {
            const entries = await this.listDir(basePath, recursive, maxDepth, 0);
            const output = entries
                .map((e) => {
                    const prefix = e.type === 'directory' ? '📁' : '📄';
                    const size = e.size !== undefined ? ` (${this.formatSize(e.size)})` : '';
                    return `${prefix} ${e.path}${size}`;
                })
                .join('\n');

            return {
                success: true,
                output: output || '(empty directory)',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error listing files',
            };
        }
    }

    private async listDir(
        dirPath: string,
        recursive: boolean,
        maxDepth: number,
        currentDepth: number
    ): Promise<FileEntry[]> {
        const entries: FileEntry[] = [];
        const items = await readdir(dirPath);

        for (const item of items) {
            // Skip hidden files and common non-essential directories
            if (item.startsWith('.') || item === 'node_modules') {
                continue;
            }

            const fullPath = join(dirPath, item);
            const stats = await stat(fullPath);

            if (stats.isDirectory()) {
                entries.push({
                    name: item,
                    path: fullPath,
                    type: 'directory',
                });

                if (recursive && currentDepth < maxDepth) {
                    const subEntries = await this.listDir(fullPath, recursive, maxDepth, currentDepth + 1);
                    entries.push(...subEntries);
                }
            } else {
                entries.push({
                    name: item,
                    path: fullPath,
                    type: 'file',
                    size: stats.size,
                });
            }
        }

        return entries;
    }

    private formatSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
    }
}

export const listFilesTool = new ListFilesTool();
