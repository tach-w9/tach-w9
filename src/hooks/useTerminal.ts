import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useProjectStore } from '../stores/projectStore';

export function useTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { addTerminalOutput, clearTerminal } = useProjectStore();

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#171717',
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

    // Initial welcome message
    term.writeln('\x1b[1;34m═══════════════════════════════════════════════════════\x1b[0m');
    term.writeln('\x1b[1;36m  TachBuilder Terminal v1.0.0\x1b[0m');
    term.writeln('\x1b[1;34m═══════════════════════════════════════════════════════\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[32m✓\x1b[0m Container initialized');
    term.writeln('\x1b[32m✓\x1b[0m File system mounted');
    term.writeln('\x1b[32m✓\x1b[0m Development server ready');
    term.writeln('');
    term.write('\x1b[1;33m➜\x1b[0m \x1b[1;36m~/project\x1b[0m $ ');

    // Handle input
    let currentLine = '';
    term.onKey(({ key, domEvent }) => {
      if (domEvent.key === 'Enter') {
        const command = currentLine.trim();
        addTerminalOutput('command', command);
        
        if (command === 'clear') {
          term.clear();
          clearTerminal();
        } else if (command === 'ls') {
          term.writeln('src/  package.json  tsconfig.json  index.html');
        } else if (command.startsWith('cat ')) {
          const filename = command.substring(4);
          term.writeln(`${filename} - file content would be displayed here`);
        } else if (command === 'npm install') {
          term.writeln('\x1b[33mInstalling dependencies...\x1b[0m');
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            term.write('\r\x1b[KProgress: ' + '█'.repeat(progress / 5) + ' ' + progress + '%');
            if (progress >= 100) {
              clearInterval(interval);
              term.writeln('\r\x1b[K\x1b[32m✓\x1b[0m Dependencies installed successfully');
              term.write('\x1b[1;33m➜\x1b[0m \x1b[1;36m~/project\x1b[0m $ ');
            }
          }, 200);
          currentLine = '';
          return;
        } else if (command === 'npm run dev') {
          term.writeln('\x1b[33mStarting development server...\x1b[0m');
          term.writeln('');
          term.writeln('\x1b[32m  VITE v5.x.x  ready in 300 ms\x1b[0m');
          term.writeln('');
          term.writeln('  > Local:   http://localhost:5173/');
          term.writeln('  > Network: use --host to expose');
          term.writeln('');
        } else if (command === 'pwd') {
          term.writeln('/workspace/project');
        } else if (command === 'whoami') {
          term.writeln('developer');
        } else if (command === 'date') {
          term.writeln(new Date().toString());
        } else if (command === 'help') {
          term.writeln('');
          term.writeln('Available commands:');
          term.writeln('  ls          - List files');
          term.writeln('  cat <file>  - Display file content');
          term.writeln('  pwd         - Print working directory');
          term.writeln('  npm install - Install dependencies');
          term.writeln('  npm run dev - Start development server');
          term.writeln('  clear       - Clear terminal');
          term.writeln('  date        - Show current date');
          term.writeln('  whoami      - Show current user');
          term.writeln('  help        - Show this help message');
        } else if (command) {
          term.writeln(`\x1b[31mCommand not found: ${command}\x1b[0m`);
          term.writeln('Type "help" for available commands');
        }
        
        currentLine = '';
        term.write('\x1b[1;33m➜\x1b[0m \x1b[1;36m~/project\x1b[0m $ ');
      } else if (domEvent.key === 'Backspace') {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (domEvent.key === 'Delete') {
        // Handle delete key
      } else if (domEvent.key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
        currentLine += key;
        term.write(key);
      }
    });

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  useEffect(() => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  });

  return { terminalRef };
}
