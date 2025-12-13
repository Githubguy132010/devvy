import { readFile, writeFile } from 'fs/promises';
import { BaseTool, type ToolResult } from './base.js';

export class EditFileTool extends BaseTool {
    readonly name = 'edit_file';
    readonly description = 'Edit an existing file by replacing specific text. Supports exact string matching or regex patterns.';
    readonly parameters = {
        type: 'object' as const,
        properties: {
            path: {
                type: 'string',
                description: 'The file path to edit',
            },
            search: {
                type: 'string',
                description: 'The text or regex pattern to search for',
            },
            replace: {
                type: 'string',
                description: 'The replacement text',
            },
            isRegex: {
                type: 'boolean',
                description: 'Whether to treat the search string as a regex pattern (optional, defaults to false)',
            },
            all: {
                type: 'boolean',
                description: 'Whether to replace all occurrences (optional, defaults to false)',
            },
        },
        required: ['path', 'search', 'replace'],
    };

    async execute(args: Record<string, unknown>): Promise<ToolResult> {
        const path = args.path as string;
        const search = args.search as string;
        const replace = args.replace as string;
        const isRegex = (args.isRegex as boolean) || false;
        const all = (args.all as boolean) || false;

        try {
            // Read the file
            const content = await readFile(path, 'utf-8');

            let newContent: string;
            let matchCount = 0;

            if (isRegex) {
                const flags = all ? 'gm' : 'm';
                const regex = new RegExp(search, flags);
                const matches = content.match(regex);
                matchCount = matches?.length || 0;
                newContent = content.replace(regex, replace);
            } else {
                if (all) {
                    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                    const matches = content.match(regex);
                    matchCount = matches?.length || 0;
                    newContent = content.split(search).join(replace);
                } else {
                    matchCount = content.includes(search) ? 1 : 0;
                    newContent = content.replace(search, replace);
                }
            }

            if (matchCount === 0) {
                return {
                    success: false,
                    error: `No matches found for: ${search}`,
                };
            }

            // Write the file
            await writeFile(path, newContent, 'utf-8');

            return {
                success: true,
                output: `File edited successfully: ${path} (${matchCount} replacement${matchCount > 1 ? 's' : ''} made)`,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error editing file',
            };
        }
    }
}

export const editFileTool = new EditFileTool();
