import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, Loader2, Globe } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { webContainerService } from '../services/webContainer';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export const Preview: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { previewUrl, setPreviewUrl } = useProjectStore();
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '100%' },
    mobile: { width: '375px', height: '100%' }
  };

  useEffect(() => {
    // Check for server URL from WebContainer
    const serverUrl = webContainerService.getServerUrl();
    if (serverUrl && serverUrl !== previewUrl) {
      setPreviewUrl(serverUrl);
    }
  }, [previewUrl, setPreviewUrl]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    
    if (iframeRef.current) {
      // Force reload the iframe
      iframeRef.current.src = 'about:blank';
      
      setTimeout(() => {
        if (iframeRef.current && previewUrl) {
          iframeRef.current.src = previewUrl;
        } else {
          setIsLoading(false);
          setError('No preview URL available. Run "npm run dev" in the terminal first.');
        }
      }, 100);
    }
  };

  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-surface border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        
        <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-background rounded text-xs text-text-secondary">
          <Globe size={12} />
          {previewUrl ? (
            <span>{previewUrl}</span>
          ) : (
            <span>No server running - Run "npm run dev" in terminal</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 hover:bg-surface rounded text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenExternal}
            disabled={!previewUrl}
            className="p-1.5 hover:bg-surface rounded text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Device toggles */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-surface/50">
        <button
          onClick={() => setDevice('desktop')}
          className={`p-1.5 rounded transition-colors ${
            device === 'desktop' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-text-primary'
          }`}
          title="Desktop"
        >
          <Monitor size={14} />
        </button>
        <button
          onClick={() => setDevice('tablet')}
          className={`p-1.5 rounded transition-colors ${
            device === 'tablet' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-text-primary'
          }`}
          title="Tablet"
        >
          <Tablet size={14} />
        </button>
        <button
          onClick={() => setDevice('mobile')}
          className={`p-1.5 rounded transition-colors ${
            device === 'mobile' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-text-primary'
          }`}
          title="Mobile"
        >
          <Smartphone size={14} />
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div
          className="bg-surface border border-border rounded-lg overflow-hidden shadow-xl relative"
          style={{
            width: deviceSizes[device].width,
            maxWidth: device === 'desktop' ? '100%' : 'none',
            height: deviceSizes[device].height,
            maxHeight: '100%',
            transition: 'width 0.3s ease'
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-primary" />
                <span className="text-sm text-text-secondary">Loading preview...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="text-center p-4">
                <Loader2 size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
                <p className="text-text-secondary">{error}</p>
                <p className="text-sm text-text-secondary mt-2">
                  Start the dev server with: <code className="bg-surface px-2 py-1 rounded">npm run dev</code>
                </p>
              </div>
            </div>
          )}

          {!previewUrl && !error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="text-center p-4">
                <Globe size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
                <p className="text-text-secondary mb-2">No preview available</p>
                <p className="text-sm text-text-secondary">
                  Click "Boot Container" in terminal, then run:
                </p>
                <code className="block bg-surface px-4 py-2 rounded mt-2 text-primary">
                  npm install && npm run dev
                </code>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={previewUrl || undefined}
            className="w-full h-full border-0"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            title="Preview"
          />
        </div>
      </div>
    </div>
  );
};
