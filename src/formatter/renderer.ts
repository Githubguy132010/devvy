import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import TerminalRenderer from 'marked-terminal';
import hljs from 'highlight.js';

class Renderer {
  private marked: Marked;

  constructor() {
    this.marked = new Marked(
      markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlight(code, { language }).value;
        },
      }),
    );
    this.marked.setOptions({
      renderer: new TerminalRenderer() as any,
    });
  }

  async render(markdown: string): Promise<string> {
    return await this.marked.parse(markdown);
  }
}

export const renderer = new Renderer();
