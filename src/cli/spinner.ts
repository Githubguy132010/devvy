import ora from 'ora';

export const TOOL_SPINNERS: Record<string, string> = {
    bash: '⚡ Executing command...',
    write_file: '📝 Writing file...',
    edit_file: '✏️ Editing file...',
    read_file: '📖 Reading file...',
    list_files: '📂 Listing files...',
};

export class ToolSpinner {
    private spinner: ReturnType<typeof ora> | null = null;

    start(toolName: string): void {
        const text = TOOL_SPINNERS[toolName] || `⚙️ Running ${toolName}...`;
        this.spinner = ora(text).start();
    }

    succeed(message?: string): void {
        if (this.spinner) {
            this.spinner.succeed(message ? `✅ ${message}` : undefined);
            this.spinner = null;
        }
    }

    fail(message?: string): void {
        if (this.spinner) {
            this.spinner.fail(message ? `❌ ${message}` : undefined);
            this.spinner = null;
        }
    }

    update(text: string): void {
        if (this.spinner) {
            this.spinner.text = text;
        }
    }
}

export const toolSpinner = new ToolSpinner();
