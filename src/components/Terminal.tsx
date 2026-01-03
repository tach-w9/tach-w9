import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Minus, Plus, Power, RefreshCw } from 'lucide-react';
import { webContainerService, prepareFilesForWebContainer } from '../services/webContainer';
import { useProjectStore } from '../stores/projectStore';

export const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { files, setPreviewUrl } = useProjectStore();
  const [isBooting, setIsBooting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const commandQueue = useRef<string[]>([]);
  const isProcessing = useRef(false);

  const processCommand = useCallback(async (command: string) => {
    if (!xtermRef.current) return;

    const term = xtermRef.current;
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case 'clear':
          term.clear();
          break;
        case 'ls':
          await webContainerService.spawn('ls', ['-la']);
          break;
        case 'pwd':
          await webContainerService.spawn('pwd', []);
          break;
        case 'whoami':
          await webContainerService.spawn('whoami', []);
          break;
        case 'date':
          await webContainerService.spawn('date', []);
          break;
        case 'help':
          term.writeln('');
          term.writeln('Available commands:');
          term.writeln('  ls           - List files');
          term.writeln('  pwd          - Print working directory');
          term.writeln('  npm install  - Install dependencies');
          term.writeln('  npm run dev  - Start dev server');
          term.writeln('  npm run build - Build for production');
          term.writeln('  cat <file>   - Display file content');
          term.writeln('  node <file>  - Run Node.js file');
          term.writeln('  clear        - Clear terminal');
          term.writeln('  help         - Show this help');
          break;
        case 'cat':
          if (args[0]) {
            await webContainerService.spawn('cat', [args[0]]);
          } else {
            term.writeln('Usage: cat <filename>');
          }
          break;
        case 'node':
          if (args[0]) {
            await webContainerService.spawn('node', [args[0]]);
          } else {
            term.writeln('Usage: node <filename>');
          }
          break;
        case 'npm':
          if (args[0] === 'install') {
            // Mount files first
            const preparedFiles = prepareFilesForWebContainer(files);
            await webContainerService.mountFiles(preparedFiles);
            
            term.writeln('\x1b[33mInstalling dependencies...\x1b[0m');
            await webContainerService.installDependencies('npm');
            term.writeln('\x1b[32m✓ Dependencies installed successfully\x1b[0m');
          } else if (args[0] === 'run' && args[1] === 'dev') {
            // Mount files first
            const preparedFiles = prepareFilesForWebContainer(files);
            await webContainerService.mountFiles(preparedFiles);
            
            term.writeln('\x1b[33mStarting development server...\x1b[0m');
            term.writeln('');
            
            const url = await webContainerService.runScript('dev');
            setPreviewUrl(url);
            
            term.writeln('\x1b[32m✓ Server running at: ' + url + '\x1b[0m');
          } else if (args[0] === 'run' && args[1] === 'build') {
            term.writeln('\x1b[33mBuilding for production...\x1b[0m');
            await webContainerService.spawn('npm', ['run', 'build']);
            term.writeln('\x1b[32m✓ Build complete\x1b[0m');
          } else {
            await webContainerService.spawn('npm', args);
          }
          break;
        default:
          // Try to execute as shell command
          await webContainerService.spawn(cmd, args);
      }
    } catch (error) {
      term.writeln(`\x1b[31mError executing command: ${error}\x1b[0m`);
    }
  }, [files, setPreviewUrl]);

  const executeNextCommand = useCallback(async () => {
    if (isProcessing.current || commandQueue.current.length === 0) return;
    
    isProcessing.current = true;
    const command = commandQueue.current.shift()!;
    
    await processCommand(command);
    
    isProcessing.current = false;
    
    // Process next command if any
    if (commandQueue.current.length > 0) {
      await executeNextCommand();
    }
  }, [processCommand]);

  const queueCommand = (command: string) => {
    commandQueue.current.push(command);
    executeNextCommand();
  };

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new XTerminal({
      theme: {
        background: '#0a0a0a',
        foreground: '#e5e5e5',
        cursor: '#3b82f6',
        selectionBackground: '#3b82f644',
        black: '#171717',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#3b82f6',
        magenta: '#a78bfa',
        cyan: '#22d3ee',
        white: '#e5e5e5',
        brightBlack: '#404040',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#a78bfa',
        brightCyan: '#22d3ee',
        brightWhite: '#fafafa'
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      allowTransparency: true,
      scrollback: 1000
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Set up WebContainer output callback
    webContainerService.setTerminalCallback((data: string) => {
      if (xtermRef.current) {
        xtermRef.current.write(data);
      }
    });

    // Welcome message
    term.writeln('\x1b[1;34m═══════════════════════════════════════════════════════\x1b[0m');
    term.writeln('\x1b[1;36m  TachBuilder Terminal v1.0.0 (WebContainers)\x1b[0m');
    term.writeln('\x1b[1;34m═══════════════════════════════════════════════════════\x1b[0m');
    term.writeln('');
    term.writeln('WebContainers enabled - Run real Node.js commands!');
    term.writeln('');
    term.writeln('Type "help" for available commands.');
    term.writeln('Type "npm install" to install dependencies.');
    term.writeln('Type "npm run dev" to start the development server.');
    term.writeln('');
    term.write('\x1b[1;33m➜\x1b[0m \x1b[1;36m~/project\x1b[0m $ ');

    let currentLine = '';
    term.onKey(({ key, domEvent }) => {
      if (domEvent.key === 'Enter') {
        const command = currentLine.trim();
        term.writeln('');
        
        if (command) {
          queueCommand(command);
        } else {
          term.write('\x1b[1;33m➜\x1b[0m \x1b[1;36m~/project\x1b[0m $ ');
        }
        
        currentLine = '';
      } else if (domEvent.key === 'Backspace') {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (domEvent.key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
        currentLine += key;
        term.write(key);
      }
    });

    const handleResize = () => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit();
        } catch (e) {
          // Ignore fit errors
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [processCommand]);

  const handleBoot = async () => {
    if (!xtermRef.current) return;
    
    setIsBooting(true);
    const term = xtermRef.current;
    
    try {
      term.writeln('\x1b[33mBooting WebContainer...\x1b[0m');
      await webContainerService.boot();
      setIsReady(true);
      term.writeln('\x1b[32m✓ WebContainer booted successfully\x1b[0m');
      term.writeln('');
    } catch (error) {
      term.writeln(`\x1b[31mFailed to boot WebContainer: ${error}\x1b[0m`);
      term.writeln('Note: WebContainers require a secure context (HTTPS or localhost)');
    } finally {
      setIsBooting(false);
    }
  };

  const handleRefresh = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.writeln('\x1b[1;34m═══════════════════════════════════════════════════════\x1b[0m');
      xtermRef.current.writeln('\x1b[1;36m  TachBuilder Terminal v1.0.0 (WebContainers)\x1b[0m');
      xtermRef.current.writeln('\x1b[1;34m═══════════════════════════════════════════════════════\x1b[0m');
      xtermRef.current.writeln('');
      xtermRef.current.write('\x1b[1;33m➜\x1b[0m \x1b[1;36m~/project\x1b[0m $ ');
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Terminal</span>
          {!isReady && !isBooting && (
            <button
              onClick={handleBoot}
              className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
            >
              <Power size={10} />
              Boot Container
            </button>
          )}
          {isBooting && (
            <span className="text-xs text-yellow-400">Booting...</span>
          )}
          {isReady && (
            <span className="text-xs text-green-400">● Ready</span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-surface rounded text-text-secondary hover:text-text-primary transition-colors"
            title="Clear terminal"
          >
            <RefreshCw size={12} />
          </button>
          <button className="p-1 hover:bg-surface rounded text-text-secondary hover:text-text-primary transition-colors">
            <Minus size={12} />
          </button>
          <button className="p-1 hover:bg-surface rounded text-text-secondary hover:text-text-primary transition-colors">
            <Plus size={12} />
          </button>
        </div>
      </div>
      <div 
        ref={terminalRef} 
        className="flex-1 overflow-hidden"
        style={{ padding: '8px' }}
      />
    </div>
  );
};
