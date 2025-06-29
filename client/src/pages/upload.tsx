import { useState } from "react";
import { Header } from "@/components/header";
import { FileUpload } from "@/components/file-upload";
import { FileTree } from "@/components/file-tree";
import { FormattedOutput } from "@/components/formatted-output";
import type { ProcessedOutput, FileTreeNode } from "@shared/schema";

export default function UploadPage() {
  const [processedData, setProcessedData] = useState<ProcessedOutput | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = (data: ProcessedOutput) => {
    setProcessedData(data);
    setError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setProcessedData(null);
  };

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FileUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          onProcessingChange={setIsProcessing}
          isProcessing={isProcessing}
          error={error}
        />

        {processedData && (
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-1">
              <FileTree
                fileTree={processedData.fileTree}
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                stats={processedData.stats}
              />
            </div>
            
            <div className="lg:col-span-2">
              <FormattedOutput
                formattedContent={processedData.formattedContent}
                stats={processedData.stats}
                selectedFile={selectedFile}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 rounded-lg p-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v1.816a2 2 0 00.586 1.414l2.848 2.849A2 2 0 004 12.416V15a2 2 0 002 2h8a2 2 0 002-2v-2.584a2 2 0 00-.586-1.414l-2.848-2.849A2 2 0 0014 6.184V5a2 2 0 00-2-2H4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">CodeArchive Parser</h3>
                  <p className="text-sm text-slate-500">Simplifying code sharing with AI</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Upload your ZIP archives and get perfectly formatted output for AI prompts. 
                Secure, fast, and developer-friendly.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Drag & drop upload
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  File tree visualization
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Code syntax highlighting
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  One-click copy to clipboard
                </li>
              </ul>
            </div>
            
            </div>
          
          <div className="border-t border-slate-200 mt-8 pt-6">
            <p className="text-sm text-slate-500 text-center">
              © 2024 CodeArchive Parser. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
