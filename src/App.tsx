import { useState } from 'react';
import { FileExplorer } from './components/FileExplorer';
import { CodeEditor } from './components/CodeEditor';
import { ChatInterface } from './components/ChatInterface';
import { Preview } from './components/Preview';
import { Terminal } from './components/Terminal';
import { 
  Code2, 
  Terminal as TerminalIcon, 
  MessageSquare, 
  Play, 
  Share2, 
  Settings,
  ChevronDown,
  Zap
} from 'lucide-react';
import { useProjectStore } from './stores/projectStore';

type TabType = 'editor' | 'chat';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [showTerminal, setShowTerminal] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const { } = useProjectStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 bg-surface border-b border-border flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-semibold text-lg">TachBuilder</span>
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeTab === 'editor' 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
            >
              <Code2 size={16} />
              Editor
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeTab === 'chat' 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
            >
              <MessageSquare size={16} />
              AI Chat
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/80 transition-colors">
            <Play size={14} />
            Run
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg text-sm transition-colors">
            <Share2 size={14} />
            Share
          </button>
          <button className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface rounded transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - File Explorer */}
        {showSidebar && (
          <div className="w-64 flex-shrink-0 border-r border-border">
            <FileExplorer />
          </div>
        )}

        {/* Toggle sidebar button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-surface border border-border rounded-r text-text-secondary hover:text-text-primary transition-colors"
          style={{ left: showSidebar ? '256px' : '0' }}
        >
          <ChevronDown 
            size={14} 
            className={`transition-transform ${showSidebar ? 'rotate-90' : '-rotate-90'}`} 
          />
        </button>

        {/* Center panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeTab === 'editor' ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-0">
                <CodeEditor />
              </div>
              
              {/* Terminal toggle */}
              <div className="border-t border-border">
                <button
                  onClick={() => setShowTerminal(!showTerminal)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-surface hover:bg-surface/80 transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <TerminalIcon size={14} />
                    Terminal
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`text-text-secondary transition-transform ${showTerminal ? 'rotate-180' : ''}`} 
                  />
                </button>
              </div>
              
              {/* Terminal */}
              {showTerminal && (
                <div className="h-48 border-t border-border">
                  <Terminal />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <ChatInterface />
            </div>
          )}
        </div>

        {/* Right panel - Preview */}
        <div className="w-1/2 flex-shrink-0 border-l border-border min-w-[400px]">
          <Preview />
        </div>
      </div>

      {/* Footer status bar */}
      <footer className="h-6 flex items-center justify-between px-4 bg-surface border-t border-border text-xs text-text-secondary flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span>TypeScript 5.x</span>
          <span>Vite 5.x</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span>JavaScript React</span>
        </div>
      </footer>
    </div>
  );
}
