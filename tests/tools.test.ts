import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { BashTool } from '../src/tools/bash.js';
import { WriteFileTool } from '../src/tools/write-file.js';
import { EditFileTool } from '../src/tools/edit-file.js';
import { ReadFileTool } from '../src/tools/read-file.js';
import { ListFilesTool } from '../src/tools/list-files.js';

// In-memory file system
let fs: Record<string, string> = {};

// Mock fs and path modules
mock.module('fs/promises', () => ({
  writeFile: async (path: string, content: string) => {
    fs[path] = content;
  },
  readFile: async (path: string) => {
    if (path in fs) {
      return fs[path];
    }
    throw new Error('File not found');
  },
  readdir: async (path: string) => {
    return Object.keys(fs);
  },
  stat: async (path: string) => ({
    isDirectory: () => !path.includes('.'),
    isFile: () => path.includes('.'),
    size: fs[path]?.length || 0,
  }),
  mkdir: async () => {},
}));

mock.module('path', () => ({
  join: (...paths: string[]) => paths.join('/'),
  dirname: (path: string) => path.split('/').slice(0, -1).join('/'),
}));

describe('Tools', () => {
  beforeEach(() => {
    fs = {};
  });

  describe('BashTool', () => {
    it('should execute a bash command', async () => {
      const tool = new BashTool();
      const result = await tool.execute({ command: 'echo "hello"' });
      expect(result.success).toBe(true);
      expect((result.output as string).trim()).toBe('hello');
    });
  });

  describe('WriteFileTool', () => {
    it('should write a file', async () => {
      const tool = new WriteFileTool();
      const result = await tool.execute({ path: 'test.txt', content: 'hello' });
      expect(result.success).toBe(true);
      expect(fs['test.txt']).toBe('hello');
    });
  });

  describe('EditFileTool', () => {
    it('should edit a file', async () => {
      fs['test.txt'] = 'hello world';
      const tool = new EditFileTool();
      const result = await tool.execute({
        path: 'test.txt',
        search: 'world',
        replace: 'all',
      });
      expect(result.success).toBe(true);
      expect(fs['test.txt']).toBe('hello all');
    });
  });

  describe('ReadFileTool', () => {
    it('should read a file', async () => {
      fs['test.txt'] = 'hello world';
      const tool = new ReadFileTool();
      const result = await tool.execute({ path: 'test.txt' });
      expect(result.success).toBe(true);
      expect(result.output).toBe('hello world');
    });
  });

  describe('ListFilesTool', () => {
    it('should list files in a directory', async () => {
      fs['file1.txt'] = '';
      fs['file2.txt'] = '';
      const tool = new ListFilesTool();
      const result = await tool.execute({ path: './' });
      expect(result.success).toBe(true);
      expect(result.output).toContain('file1.txt');
      expect(result.output).toContain('file2.txt');
    });
  });
});
