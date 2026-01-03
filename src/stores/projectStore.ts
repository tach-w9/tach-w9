import { create } from 'zustand';
import { FileNode, TerminalOutput } from '../types';

interface ProjectState {
  files: Record<string, FileNode>;
  openTabs: string[];
  activeFile: string | null;
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: number }>;
  terminalOutput: TerminalOutput[];
  isAiThinking: boolean;
  previewUrl: string | null;
  
  setActiveFile: (path: string) => void;
  addOpenTab: (path: string) => void;
  closeTab: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  createFile: (path: string, name: string, content?: string, language?: string) => void;
  createFolder: (path: string, name: string) => void;
  deleteFile: (path: string) => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setAiThinking: (thinking: boolean) => void;
  addTerminalOutput: (type: TerminalOutput['type'], content: string) => void;
  clearTerminal: () => void;
  setPreviewUrl: (url: string | null) => void;
  getFileContent: (path: string) => string;
  getAllFiles: () => Array<{ path: string; content: string }>;
}

const initialFiles: Record<string, FileNode> = {
  'index.html': {
    id: '1',
    name: 'index.html',
    type: 'file',
    path: '/index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
  },
  'src': {
    id: '2',
    name: 'src',
    type: 'folder',
    path: '/src',
    expanded: true,
    children: [
      {
        id: '3',
        name: 'main.tsx',
        type: 'file',
        path: '/src/main.tsx',
        language: 'typescript',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
      },
      {
        id: '4',
        name: 'App.tsx',
        type: 'file',
        path: '/src/App.tsx',
        language: 'typescript',
        content: `import { useState } from 'react'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header>
        <h1>Welcome to TachBuilder</h1>
        <p>AI-Powered Web Development Environment</p>
      </header>
      
      <main>
        <div className="card">
          <button onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
          <p>Click the button to increment the counter</p>
        </div>
        
        <div className="info">
          <h2>Features:</h2>
          <ul>
            <li>AI-powered code generation</li>
            <li>Real-time preview</li>
            <li>Full code editor</li>
            <li>Terminal simulation</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default App`
      },
      {
        id: '5',
        name: 'index.css',
        type: 'file',
        path: '/src/index.css',
        language: 'css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e5e5e5;
  min-height: 100vh;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

header p {
  color: #a3a3a3;
  font-size: 1.1rem;
}

main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.card button {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  color: white;
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.card p {
  margin-top: 1rem;
  color: #a3a3a3;
}

.info {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
}

.info h2 {
  margin-bottom: 1rem;
  color: #3b82f6;
}

.info ul {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.info li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.info li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #3b82f6;
}`
      },
      {
        id: '6',
        name: 'vite-env.d.ts',
        type: 'file',
        path: '/src/vite-env.d.ts',
        language: 'typescript',
        content: `/// <reference types="vite/client" />`
      }
    ]
  },
  'package.json': {
    id: '7',
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    language: 'json',
    content: `{
  "name": "my-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "typescript": "^5.6.3",
    "vite": "^5.4.11"
  }
}`
  },
  'tsconfig.json': {
    id: '8',
    name: 'tsconfig.json',
    type: 'file',
    path: '/tsconfig.json',
    language: 'json',
    content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}`
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useProjectStore = create<ProjectState>((set, get) => ({
  files: initialFiles,
  openTabs: ['/src/App.tsx'],
  activeFile: '/src/App.tsx',
  messages: [],
  terminalOutput: [
    {
      id: generateId(),
      type: 'output',
      content: 'Welcome to TachBuilder v1.0.0',
      timestamp: Date.now()
    },
    {
      id: generateId(),
      type: 'output',
      content: 'Initializing development environment...',
      timestamp: Date.now()
    },
    {
      id: generateId(),
      type: 'success',
      content: '✓ Environment ready',
      timestamp: Date.now()
    }
  ],
  isAiThinking: false,
  previewUrl: null,

  setActiveFile: (path: string) => set({ activeFile: path }),

  addOpenTab: (path: string) => set((state) => ({
    openTabs: state.openTabs.includes(path) ? state.openTabs : [...state.openTabs, path]
  })),

  closeTab: (path: string) => set((state) => {
    const newTabs = state.openTabs.filter(t => t !== path);
    return {
      openTabs: newTabs,
      activeFile: state.activeFile === path ? (newTabs[newTabs.length - 1] || null) : state.activeFile
    };
  }),

  updateFileContent: (path: string, content: string) => set((state) => ({
    files: {
      ...state.files,
      [path]: { ...state.files[path], content }
    }
  })),

  createFile: (path: string, name: string, content: string = '', language: string = 'typescript') => {
    const newFile: FileNode = {
      id: generateId(),
      name,
      type: 'file',
      path,
      content,
      language
    };
    set((state) => ({
      files: { ...state.files, [path]: newFile },
      openTabs: [...state.openTabs, path],
      activeFile: path
    }));
  },

  createFolder: (path: string, name: string) => {
    const newFolder: FileNode = {
      id: generateId(),
      name,
      type: 'folder',
      path,
      expanded: false
    };
    set((state) => ({
      files: { ...state.files, [path]: newFolder }
    }));
  },

  deleteFile: (path: string) => {
    const { [path]: deleted, ...rest } = get().files;
    set((state) => ({
      files: rest,
      openTabs: state.openTabs.filter(t => t !== path),
      activeFile: state.activeFile === path ? null : state.activeFile
    }));
  },

  addMessage: (role: 'user' | 'assistant', content: string) => set((state) => ({
    messages: [...state.messages, {
      id: generateId(),
      role,
      content,
      timestamp: Date.now()
    }]
  })),

  setAiThinking: (thinking: boolean) => set({ isAiThinking: thinking }),

  addTerminalOutput: (type: TerminalOutput['type'], content: string) => set((state) => ({
    terminalOutput: [...state.terminalOutput, {
      id: generateId(),
      type,
      content,
      timestamp: Date.now()
    }]
  })),

  clearTerminal: () => set({ terminalOutput: [] }),

  setPreviewUrl: (url: string | null) => set({ previewUrl: url }),

  getFileContent: (path: string) => get().files[path]?.content || '',
  
  getAllFiles: () => {
    const files: { path: string; content: string }[] = [];
    const traverse = (node: FileNode) => {
      if (node.type === 'file') {
        files.push({ path: node.path, content: node.content || '' });
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    Object.values(get().files).forEach(traverse);
    return files;
  }
}));
