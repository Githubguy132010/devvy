import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { BaseTool, type ToolResult } from './base.js';

export class WriteFileTool extends BaseTool {
    readonly name = 'write_file';
    readonly description = 'Create or overwrite a file with the given content. Creates parent directories if needed.';
    readonly parameters = {
        type: 'object' as const,
        properties: {
            path: {
                type: 'string',
                description: 'The file path to write to (relative or absolute)',
            },
            content: {
                type: 'string',
                description: 'The content to write to the file',
            },
        },
        required: ['path', 'content'],
    };

    async execute(args: Record<string, unknown>): Promise<ToolResult> {
        const path = args.path as string;
        const content = args.content as string;

        try {
            // Ensure parent directory exists
            const dir = dirname(path);
            await mkdir(dir, { recursive: true });

            // Write the file
            await writeFile(path, content, 'utf-8');

            return {
                success: true,
                output: `File written successfully: ${path}`,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error writing file',
            };
        }
    }
}

export const writeFileTool = new WriteFileTool();
