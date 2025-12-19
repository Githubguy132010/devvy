import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { BaseTool, type ToolResult } from './base.js';
import { FileSystemError } from '../core/errors.js';
import { logger } from '../core/logger.js';
import { validateFilePath, requireValid } from '../core/validation.js';

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

        // Input validation
        if (!path || typeof path !== 'string') {
            return {
                success: false,
                error: 'Path is required and must be a string',
            };
        }

        if (content === undefined || typeof content !== 'string') {
            return {
                success: false,
                error: 'Content is required and must be a string',
            };
        }

        // Security validation for file path
        const pathValidation = validateFilePath(path, true); // allowWrite = true
        if (!pathValidation.isValid) {
            return {
                success: false,
                error: pathValidation.errors.join(', '),
            };
        }

        // Content size validation
        if (content.length > 10000000) { // 10MB limit
            return {
                success: false,
                error: 'Content too large (max 10MB)',
            };
        }

        try {
            // Ensure parent directory exists
            const dir = dirname(path);
            await mkdir(dir, { recursive: true });

            // Write the file
            await writeFile(path, content, 'utf-8');

            logger.info('File written successfully', { path, size: content.length });
            return {
                success: true,
                output: `File written successfully: ${path}`,
            };
        } catch (error) {
            const fileError = error instanceof Error ? new FileSystemError(error.message, path, { originalError: error.name }) : new FileSystemError('Unknown error writing file', path);
            logger.error(fileError);
            
            return {
                success: false,
                error: fileError.message,
            };
        }
    }
}

export const writeFileTool = new WriteFileTool();
