import { WordTokenizer } from 'natural';

class QuestionDetector {
  private tokenizer: WordTokenizer;

  constructor() {
    this.tokenizer = new WordTokenizer();
  }

  isQuestion(text: string): boolean {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    if (!tokens) {
      return false;
    }

    const questionWords = ['what', 'who', 'when', 'where', 'why', 'how', 'is', 'are', 'do', 'does'];
    return questionWords.includes(tokens[0]) || text.endsWith('?');
  }
}

export const questionDetector = new QuestionDetector();
