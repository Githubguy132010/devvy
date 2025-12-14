import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import hljs from 'highlight.js';

class Renderer {
  constructor() {
    marked.setOptions({
      renderer: new TerminalRenderer() as any,
      highlight: (code: string, lang: string) => {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
    });
  }

  async render(markdown: string): Promise<string> {
    return await marked(markdown);
  }
}

export const renderer = new Renderer();
