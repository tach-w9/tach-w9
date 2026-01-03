import React from 'react';
import Editor from '@monaco-editor/react';
import { X } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';

export const CodeEditor: React.FC = () => {
  const { files, openTabs, activeFile, setActiveFile, closeTab, updateFileContent } = useProjectStore();

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile, value);
    }
  };

  const getLanguage = (filename: string): string => {
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.html')) return 'html';
    return 'typescript';
  };

  const getFileContent = (path: string): string => {
    const file = files[path];
    if (!file) return '';
    if (file.content) return file.content;
    if (file.children) return '';
    return '';
  };

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-background text-text-secondary">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <p>Select a file to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tabs */}
      <div className="flex bg-surface border-b border-border overflow-x-auto">
        {openTabs.map((tab) => {
          const file = files[tab];
          if (!file) return null;
          
          return (
            <div
              key={tab}
              className={`flex items-center gap-2 px-3 py-2 min-w-0 border-r border-border cursor-pointer hover:bg-surface/80 transition-colors ${
                activeFile === tab ? 'bg-background border-t-2 border-t-primary' : ''
              }`}
              onClick={() => setActiveFile(tab)}
            >
              <span className="text-xs">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab);
                }}
                className="p-0.5 hover:bg-border rounded opacity-60 hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(activeFile)}
          value={getFileContent(activeFile)}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            fontLigatures: true,
            contextmenu: true,
            mouseWheelZoom: true,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
        />
      </div>
    </div>
  );
};
