import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Check } from "lucide-react";
import type { ProcessingStats } from "@shared/schema";

interface FormattedOutputProps {
  formattedContent: string;
  stats: ProcessingStats;
  selectedFile: string | null;
}

export function FormattedOutput({ formattedContent, stats, selectedFile }: FormattedOutputProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedContent);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "The formatted content has been copied to your clipboard.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadAsText = () => {
    const blob = new Blob([formattedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codebase-formatted.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your formatted codebase is being downloaded.",
    });
  };

  // Format the content for display with syntax highlighting
  const formatContentForDisplay = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Simple syntax highlighting for display
      let formattedLine = line;
      
      // Headers
      if (line.startsWith('# ')) {
        return (
          <div key={index} className="text-emerald-400 font-medium">
            <span className="text-slate-400"># </span>
            {line.substring(2)}
          </div>
        );
      }
      
      if (line.startsWith('## ')) {
        return (
          <div key={index} className="text-blue-400 font-medium">
            {line}
          </div>
        );
      }
      
      if (line.startsWith('### ')) {
        return (
          <div key={index} className="text-emerald-400 border-b border-slate-700 pb-1">
            <span className="text-slate-400">### </span>
            {line.substring(4)}
          </div>
        );
      }
      
      // Code block markers
      if (line.startsWith('```')) {
        return (
          <div key={index} className="text-slate-500 text-xs">
            {line}
          </div>
        );
      }
      
      // File tree structure
      if (line.includes('├──') || line.includes('└──')) {
        const parts = line.split(/([├└]──)/);
        return (
          <div key={index} className="text-slate-400">
            {parts.map((part, partIndex) => {
              if (part.includes('├──') || part.includes('└──')) {
                return <span key={partIndex} className="text-amber-300">{part}</span>;
              } else if (part.includes('📁')) {
                return <span key={partIndex} className="text-amber-300">{part}</span>;
              } else if (part.includes('📄')) {
                return <span key={partIndex} className="text-slate-400">{part}</span>;
              }
              return <span key={partIndex}>{part}</span>;
            })}
          </div>
        );
      }
      
      return (
        <div key={index} className="text-slate-300">
          {line || '\u00A0'}
        </div>
      );
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Formatted Output</h3>
            <p className="text-sm text-slate-500 mt-1">Ready to copy and paste into your AI prompt</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={copyToClipboard}
              className={`font-medium transition-colors ${
                copied 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadAsText}
              className="text-slate-400 hover:text-slate-600"
              title="Download as Text"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Output Preview */}
        <div className="bg-slate-900 rounded-lg p-6 overflow-auto max-h-screen">
          <div className="font-mono text-sm space-y-1">
            {formatContentForDisplay(formattedContent)}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.totalFiles}</div>
            <div className="text-sm text-slate-500">Total Files</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.linesOfCode.toLocaleString()}</div>
            <div className="text-sm text-slate-500">Lines of Code</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.fileSize}</div>
            <div className="text-sm text-slate-500">Archive Size</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.processingTime}</div>
            <div className="text-sm text-slate-500">Processing Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
