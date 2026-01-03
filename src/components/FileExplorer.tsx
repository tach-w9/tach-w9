import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, FileJson, FileText, File, ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { FileNode } from '../types';

const getFileIcon = (name: string) => {
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode size={16} className="text-blue-400" />;
  if (name.endsWith('.css')) return <FileText size={16} className="text-purple-400" />;
  if (name.endsWith('.json')) return <FileJson size={16} className="text-yellow-400" />;
  if (name.endsWith('.html')) return <FileText size={16} className="text-orange-400" />;
  return <File size={16} className="text-gray-400" />;
};

const FileTreeItem: React.FC<{ node: FileNode; depth?: number }> = ({ node, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(node.expanded || false);
  const { setActiveFile, addOpenTab, activeFile, deleteFile } = useProjectStore();

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      setActiveFile(node.path);
      addOpenTab(node.path);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'file' && window.confirm(`Delete ${node.name}?`)) {
      deleteFile(node.path);
    }
  };

  const isActive = activeFile === node.path;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-surface transition-colors ${
          isActive ? 'bg-surface border-l-2 border-primary' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' && (
          <span className="text-text-secondary">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        {depth === 0 && <span className="w-4" />}
        
        <span className="flex items-center gap-1.5 flex-1">
          {node.type === 'folder' ? (
            isExpanded ? <FolderOpen size={16} className="text-yellow-400" /> : <Folder size={16} className="text-yellow-400" />
          ) : (
            getFileIcon(node.name)
          )}
          <span className="text-sm text-text-primary">{node.name}</span>
        </span>

        {node.type === 'file' && (
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-400"
            title="Delete file"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
      
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC = () => {
  const { files, createFile } = useProjectStore();
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const name = newFileName.trim();
      const path = `/src/${name}`;
      createFile(path, name, '', getLanguageFromName(name));
      setNewFileName('');
      setShowNewFile(false);
    }
  };

  const getLanguageFromName = (name: string): string => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return 'typescript';
    if (name.endsWith('.css')) return 'css';
    if (name.endsWith('.json')) return 'json';
    if (name.endsWith('.html')) return 'html';
    return 'typescript';
  };

  const rootFiles = Object.values(files).filter(f => {
    const depth = f.path.split('/').filter(Boolean).length - 1;
    return depth === 0;
  });

  return (
    <div className="h-full flex flex-col bg-surface border-r border-border">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Explorer</span>
          <div className="flex gap-1">
            <button
              onClick={() => setShowNewFile(true)}
              className="p-1 hover:bg-surface rounded text-text-secondary hover:text-text-primary transition-colors"
              title="New File"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-2">
        {rootFiles.map((file) => (
          <FileTreeItem key={file.id} node={file} />
        ))}
      </div>

      {showNewFile && (
        <div className="p-2 border-t border-border">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
            onBlur={() => setShowNewFile(false)}
            placeholder="filename.tsx"
            className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-primary"
            autoFocus
          />
        </div>
      )}
    </div>
  );
};
