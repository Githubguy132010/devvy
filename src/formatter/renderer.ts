import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import hljs from 'highlight.js';

class Renderer {
  constructor() {
    marked.setOptions({
      renderer: new TerminalRenderer(),
      highlight: (code, lang) => {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
    });
  }

  render(markdown: string): string {
    return marked(markdown);
  }
}

export const renderer = new Renderer();
