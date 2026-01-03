import { WebContainer } from '@webcontainer/api';

class WebContainerService {
  private instance: WebContainer | null = null;
  private terminalCallback: ((data: string) => void) | null = null;
  private serverUrl: string | null = null;

  async boot(): Promise<void> {
    if (this.instance) return;

    try {
      this.instance = await WebContainer.boot();
      console.log('WebContainer booted successfully');
    } catch (error) {
      console.error('Failed to boot WebContainer:', error);
      throw error;
    }
  }

  async mountFiles(files: Record<string, { file: { contents: string } }>): Promise<void> {
    if (!this.instance) {
      await this.boot();
    }
    
    if (this.instance) {
      await this.instance.mount(files);
    }
  }

  async installDependencies(packageManager: 'npm' | 'pnpm' | 'yarn' = 'npm'): Promise<void> {
    if (!this.instance) {
      await this.boot();
    }

    if (this.instance) {
      const installProcess = await this.instance.spawn(packageManager, ['install']);
      
      // Stream output to terminal
      installProcess.output.pipeTo(new WritableStream({
        write: (data) => {
          this.terminalCallback?.(data);
        }
      }));

      await installProcess.exit;
    }
  }

  async runScript(scriptName: string): Promise<string> {
    if (!this.instance) {
      await this.boot();
    }

    if (this.instance) {
      const process = await this.instance.spawn('npm', ['run', scriptName]);

      process.output.pipeTo(new WritableStream({
        write: (data) => {
          this.terminalCallback?.(data);
        }
      }));

      await process.exit;

      // Listen for server-ready event
      return new Promise<string>((resolve) => {
        if (this.instance) {
          this.instance.on('server-ready', (_port, url) => {
            this.serverUrl = url;
            this.terminalCallback?.(`\nServer ready at: ${url}\n`);
            resolve(url);
          });
          
          // Timeout fallback
          setTimeout(() => {
            if (!this.serverUrl) {
              resolve('http://localhost:5173');
            }
          }, 30000);
        } else {
          resolve('http://localhost:5173');
        }
      });
    }

    return 'http://localhost:5173';
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.instance) {
      await this.boot();
    }

    if (this.instance) {
      await this.instance.fs.writeFile(path, content);
    }
  }

  async readFile(path: string): Promise<string> {
    if (!this.instance) {
      await this.boot();
    }

    if (this.instance) {
      return await this.instance.fs.readFile(path, 'utf-8');
    }

    return '';
  }

  async spawn(command: string, args: string[]): Promise<void> {
    if (!this.instance) {
      await this.boot();
    }

    if (this.instance) {
      const process = await this.instance.spawn(command, args);

      process.output.pipeTo(new WritableStream({
        write: (data) => {
          this.terminalCallback?.(data);
        }
      }));

      await process.exit;
    }
  }

  setTerminalCallback(callback: (data: string) => void): void {
    this.terminalCallback = callback;
  }

  getServerUrl(): string | null {
    return this.serverUrl;
  }

  async getFileSystem(): Promise<Record<string, { file: { contents: string } }>> {
    if (!this.instance) {
      return {};
    }

    const fileSystem: Record<string, { file: { contents: string } }> = {};
    
    // This is a simplified version - in production you'd recursively read directories
    try {
      // Read specific files that we know exist
      const files = ['package.json', 'index.html', 'src/main.tsx', 'src/App.tsx', 'src/index.css'];
      
      for (const file of files) {
        try {
          const content = await this.instance!.fs.readFile(file, 'utf-8');
          fileSystem[file] = { file: { contents: content } };
        } catch {
          // File doesn't exist yet
        }
      }
    } catch (error) {
      console.error('Error reading file system:', error);
    }

    return fileSystem;
  }
}

export const webContainerService = new WebContainerService();

// Helper function to prepare files for WebContainer mounting
export function prepareFilesForWebContainer(
  files: Record<string, { content?: string; language?: string }>
): Record<string, { file: { contents: string } }> {
  const prepared: Record<string, { file: { contents: string } }> = {};
  
  Object.entries(files).forEach(([path, file]) => {
    if (file.content !== undefined) {
      // Convert path like "/src/App.tsx" to "src/App.tsx"
      const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
      prepared[normalizedPath] = {
        file: {
          contents: file.content
        }
      };
    }
  });

  return prepared;
}
