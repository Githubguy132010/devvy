// Initialize tool registry with all available tools
import { toolRegistry } from './registry.js';
import { bashTool } from './bash.js';
import { writeFileTool } from './write-file.js';
import { editFileTool } from './edit-file.js';
import { readFileTool } from './read-file.js';
import { listFilesTool } from './list-files.js';

export function initializeTools(): void {
    toolRegistry.register(bashTool);
    toolRegistry.register(writeFileTool);
    toolRegistry.register(editFileTool);
    toolRegistry.register(readFileTool);
    toolRegistry.register(listFilesTool);
}

// Auto-initialize on import
initializeTools();
