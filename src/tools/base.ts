export interface ToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, {
            type: string;
            description: string;
            enum?: string[];
        }>;
        required?: string[];
    };
}

export interface ToolResult {
    success: boolean;
    output?: string;
    error?: string;
}

export abstract class BaseTool {
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly parameters: ToolDefinition['parameters'];

    abstract execute(args: Record<string, unknown>): Promise<ToolResult>;

    toOpenAITool(): { type: 'function'; function: ToolDefinition } {
        return {
            type: 'function',
            function: {
                name: this.name,
                description: this.description,
                parameters: this.parameters,
            },
        };
    }
}
