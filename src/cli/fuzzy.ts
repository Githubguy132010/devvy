import Fuse from 'fuse.js';

// Available slash commands
export const SLASH_COMMANDS = [
    '/model',
    '/config',
    '/clear',
    '/history',
    '/help',
    '/exit',
];

// Available agent commands
export const AGENT_COMMANDS = [
    '@coder',
    '@critic',
    '@debugger',
    '@architect',
    '@enduser',
    '@review',
    '@brainstorm',
];

/**
 * Fuzzy search through a list of items
 */
export function fuzzySearch<T>(
    items: T[],
    query: string,
    keys: (keyof T & string)[]
): T[] {
    if (!query) return items;

    const fuse = new Fuse(items, {
        keys,
        threshold: 0.4,
        ignoreLocation: true,
    });

    return fuse.search(query).map((r) => r.item);
}

/**
 * Fuzzy search through a list of string items
 */
export function fuzzySearchStrings(items: string[], query: string): string[] {
    if (!query) return items;

    const fuse = new Fuse(items, {
        threshold: 0.4,
        ignoreLocation: true,
    });

    return fuse.search(query).map((r) => r.item);
}

/**
 * Find the best matching command from a fuzzy input
 */
export function fuzzyMatchCommand(input: string, commands: string[]): string | null {
    if (!input) return null;

    // Check for exact match first
    const exactMatch = commands.find((cmd) => cmd === input);
    if (exactMatch) return exactMatch;

    // Check if input starts with any command prefix
    const startsWithMatch = commands.find((cmd) => input.startsWith(cmd.slice(0, Math.max(2, input.length))));
    if (startsWithMatch) return startsWithMatch;

    // Fuzzy search
    const results = fuzzySearchStrings(commands, input);
    return results.length > 0 ? results[0] : null;
}

/**
 * Suggest commands based on partial input
 */
export function suggestCommands(input: string): string[] {
    const allCommands = [...SLASH_COMMANDS, ...AGENT_COMMANDS];

    if (!input) return [];

    if (input.startsWith('/')) {
        return fuzzySearchStrings(SLASH_COMMANDS, input).slice(0, 5);
    }

    if (input.startsWith('@')) {
        return fuzzySearchStrings(AGENT_COMMANDS, input).slice(0, 5);
    }

    return [];
}
