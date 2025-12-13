import { BaseTool, type ToolResult } from './base.js';

export class ToolRegistry {
    private tools: Map<string, BaseTool> = new Map();

    register(tool: BaseTool): void {
        this.tools.set(tool.name, tool);
    }

    get(name: string): BaseTool | undefined {
        return this.tools.get(name);
    }

    getAll(): BaseTool[] {
        return Array.from(this.tools.values());
    }

    getAllNames(): string[] {
        return Array.from(this.tools.keys());
    }

    toOpenAITools(): { type: 'function'; function: { name: string; description: string; parameters: object } }[] {
        return this.getAll().map((tool) => tool.toOpenAITool());
    }

    async execute(name: string, args: Record<string, unknown>): Promise<ToolResult> {
        const tool = this.get(name);
        if (!tool) {
            return {
                success: false,
                error: `Unknown tool: ${name}`,
            };
        }
        return tool.execute(args);
    }
}

export const toolRegistry = new ToolRegistry();
