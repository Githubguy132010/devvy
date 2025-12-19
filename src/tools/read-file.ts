import { readFile } from 'fs/promises';
import { BaseTool, type ToolResult } from './base.js';
import { FileSystemError } from '../core/errors.js';
import { logger } from '../core/logger.js';

export class ReadFileTool extends BaseTool {
    readonly name = 'read_file';
    readonly description = 'Read the contents of a file.';
    readonly parameters = {
        type: 'object' as const,
        properties: {
            path: {
                type: 'string',
                description: 'The file path to read',
            },
            startLine: {
                type: 'number',
                description: 'Starting line number (1-indexed, optional)',
            },
            endLine: {
                type: 'number',
                description: 'Ending line number (1-indexed, inclusive, optional)',
            },
        },
        required: ['path'],
    };

    async execute(args: Record<string, unknown>): Promise<ToolResult> {
        const path = args.path as string;
        const startLine = args.startLine as number | undefined;
        const endLine = args.endLine as number | undefined;

        try {
            const content = await readFile(path, 'utf-8');

            if (startLine !== undefined || endLine !== undefined) {
                const lines = content.split('\n');
                const start = (startLine || 1) - 1;
                const end = endLine || lines.length;
                const selectedLines = lines.slice(start, end);

                return {
                    success: true,
                    output: selectedLines.join('\n'),
                };
            }

            return {
                success: true,
                output: content,
            };
        } catch (error) {
            const fileError = error instanceof Error ? new FileSystemError(error.message, path, { originalError: error.name }) : new FileSystemError('Unknown error reading file', path);
            logger.error(fileError);
            
            return {
                success: false,
                error: fileError.message,
            };
        }
    }
}

export const readFileTool = new ReadFileTool();
