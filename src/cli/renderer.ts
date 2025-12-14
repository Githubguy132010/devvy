import chalk from 'chalk';
import { highlight } from 'cli-highlight';

// Code block formatting constants
const CODE_BLOCK_BORDER_WIDTH = 60;

export class TerminalRenderer {
  private typingSpeed: number = 2; // chars per tick for typing effect
  private enableTypingEffect: boolean = true;

  constructor() {}

  /**
   * Render markdown-style text to formatted terminal output
   */
  renderMarkdown(text: string): string {
    // Simple markdown rendering without external library
    let result = text;
    
    // Bold text
    result = result.replace(/\*\*(.+?)\*\*/g, (_, content) => chalk.bold(content));
    
    // Italic text
    result = result.replace(/\*(.+?)\*/g, (_, content) => chalk.italic(content));
    
    // Inline code
    result = result.replace(/`([^`]+)`/g, (_, content) => chalk.bgBlack.yellow(` ${content} `));
    
    // Headers
    result = result.replace(/^### (.+)$/gm, (_, content) => chalk.bold.yellow(`───▶ ${content}`));
    result = result.replace(/^## (.+)$/gm, (_, content) => chalk.bold.blue(`────▶ ${content}`));
    result = result.replace(/^# (.+)$/gm, (_, content) => chalk.bold.cyan(`─────▶ ${content}`));
    
    // Lists
    result = result.replace(/^\* (.+)$/gm, (_, content) => chalk.cyan('  • ') + content);
    result = result.replace(/^- (.+)$/gm, (_, content) => chalk.cyan('  • ') + content);
    
    return result;
  }

  /**
   * Stream text with typing effect
   */
  async *streamWithTypingEffect(text: string): AsyncGenerator<string> {
    if (!this.enableTypingEffect) {
      yield text;
      return;
    }

    let buffer = '';
    for (let i = 0; i < text.length; i++) {
      buffer += text[i];
      
      // Yield in chunks for typing effect
      if (buffer.length >= this.typingSpeed) {
        yield buffer;
        buffer = '';
        // Small delay to simulate typing
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    }
    
    // Yield remaining buffer
    if (buffer) {
      yield buffer;
    }
  }

  /**
   * Render a chunk of streamed content
   * Accumulates chunks and renders complete markdown blocks when possible
   */
  renderChunk(chunk: string, previousBuffer: string = ''): { rendered: string; buffer: string } {
    const fullText = previousBuffer + chunk;
    
    // Check if we have complete markdown blocks (code blocks, paragraphs, etc.)
    // For now, return the chunk as-is during streaming for real-time feedback
    // Full rendering will happen at the end
    return {
      rendered: chunk,
      buffer: fullText,
    };
  }

  /**
   * Render the final complete response
   */
  renderComplete(fullText: string): string {
    return this.renderMarkdown(fullText);
  }

  /**
   * Toggle typing effect
   */
  setTypingEffect(enabled: boolean): void {
    this.enableTypingEffect = enabled;
  }

  /**
   * Set typing speed (characters per tick)
   */
  setTypingSpeed(speed: number): void {
    this.typingSpeed = Math.max(1, speed);
  }

  /**
   * Detect if text contains code blocks
   */
  hasCodeBlocks(text: string): boolean {
    return /```[\s\S]*?```/.test(text);
  }

  /**
   * Extract and highlight code blocks from text
   */
  highlightCodeBlocks(text: string): string {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    return text.replace(codeBlockRegex, (match, lang, code) => {
      try {
        if (lang) {
          const highlighted = highlight(code.trim(), {
            language: lang,
            ignoreIllegals: true,
          });
          const langBorderLength = Math.max(0, CODE_BLOCK_BORDER_WIDTH - 3 - lang.length);
          return `\n${chalk.gray('┌─ ' + lang + ' ─' + '─'.repeat(langBorderLength))}\n${highlighted}\n${chalk.gray('└' + '─'.repeat(CODE_BLOCK_BORDER_WIDTH))}\n`;
        }
        return `\n${chalk.gray('┌' + '─'.repeat(CODE_BLOCK_BORDER_WIDTH))}\n${code.trim()}\n${chalk.gray('└' + '─'.repeat(CODE_BLOCK_BORDER_WIDTH))}\n`;
      } catch {
        return `\n${chalk.gray('┌' + '─'.repeat(CODE_BLOCK_BORDER_WIDTH))}\n${code.trim()}\n${chalk.gray('└' + '─'.repeat(CODE_BLOCK_BORDER_WIDTH))}\n`;
      }
    });
  }
}

export const terminalRenderer = new TerminalRenderer();
