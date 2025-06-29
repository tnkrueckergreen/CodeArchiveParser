import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Folder, 
  FolderOpen, 
  File, 
  ChevronRight, 
  ChevronDown,
  Expand,
  Shrink
} from "lucide-react";
import type { FileTreeNode, ProcessingStats } from "@shared/schema";

interface FileTreeProps {
  fileTree: FileTreeNode[];
  onFileSelect: (filePath: string) => void;
  selectedFile: string | null;
  stats: ProcessingStats;
}

export function FileTree({ fileTree, onFileSelect, selectedFile, stats }: FileTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allPaths = new Set<string>();
    
    const collectPaths = (nodes: FileTreeNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'folder' && node.children) {
          allPaths.add(node.path);
          collectPaths(node.children);
        }
      });
    };
    
    collectPaths(fileTree);
    setExpandedNodes(allPaths);
    setAllExpanded(true);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
    setAllExpanded(false);
  };

  const getFileIcon = (node: FileTreeNode) => {
    if (node.type === 'folder') {
      const isExpanded = expandedNodes.has(node.path);
      return isExpanded ? <FolderOpen className="w-4 h-4 text-amber-500" /> : <Folder className="w-4 h-4 text-amber-500" />;
    }

    // File type specific icons based on extension
    const ext = node.extension?.toLowerCase();
    const iconClass = "w-4 h-4";
    
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext || '')) {
      return <File className={`${iconClass} text-yellow-500`} />;
    } else if (['.html', '.htm'].includes(ext || '')) {
      return <File className={`${iconClass} text-orange-500`} />;
    } else if (['.css', '.scss', '.sass'].includes(ext || '')) {
      return <File className={`${iconClass} text-blue-500`} />;
    } else if (['.json', '.yaml', '.yml'].includes(ext || '')) {
      return <File className={`${iconClass} text-green-500`} />;
    } else if (['.md', '.txt'].includes(ext || '')) {
      return <File className={`${iconClass} text-gray-500`} />;
    } else {
      return <File className={`${iconClass} text-slate-400`} />;
    }
  };

  const renderTreeNode = (node: FileTreeNode, level = 0) => {
    const isExpanded = expandedNodes.has(node.path);
    const isSelected = selectedFile === node.path;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer group ${
            isSelected 
              ? 'bg-blue-50 border-l-2 border-blue-500 text-blue-800' 
              : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder' && hasChildren) {
              toggleNode(node.path);
            } else if (node.type === 'file') {
              onFileSelect(node.path);
            }
          }}
        >
          {node.type === 'folder' && hasChildren && (
            <div className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-slate-400" />
              )}
            </div>
          )}
          {(!hasChildren || node.type === 'file') && (
            <div className="w-4 h-4"></div>
          )}
          
          {getFileIcon(node)}
          
          <span className={`text-sm font-mono ${isSelected ? 'font-medium' : ''}`}>
            {node.name}
          </span>
        </div>
        
        {node.type === 'folder' && hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-24">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Project Structure</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={expandAll}
              className="p-1.5 text-slate-400 hover:text-slate-600"
              title="Expand All"
            >
              <Expand className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={collapseAll}
              className="p-1.5 text-slate-400 hover:text-slate-600"
              title="Collapse All"
            >
              <Shrink className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="mt-2 text-sm text-slate-500">
          <span>{stats.totalFiles}</span> files • <span>{stats.totalFolders}</span> folders
        </div>
      </div>
      
      <ScrollArea className="h-96 px-4 py-4">
        <div className="space-y-1">
          {fileTree.map(node => renderTreeNode(node))}
        </div>
      </ScrollArea>
    </div>
  );
}
