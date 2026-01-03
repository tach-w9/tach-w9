export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  language?: string;
  children?: FileNode[];
  expanded?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
  filename: string;
  content: string;
  language: string;
}

export interface TerminalOutput {
  id: string;
  type: 'input' | 'output' | 'command' | 'error' | 'success';
  content: string;
  timestamp: number;
}

export interface ProjectState {
  files: Record<string, FileNode>;
  openTabs: string[];
  activeFile: string | null;
  messages: Message[];
  terminalOutput: TerminalOutput[];
  isAiThinking: boolean;
  previewUrl: string | null;
}
