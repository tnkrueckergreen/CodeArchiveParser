import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CloudUpload, Check, AlertTriangle, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProcessedOutput } from "@shared/schema";

interface FileUploadProps {
  onUploadSuccess: (data: ProcessedOutput) => void;
  onUploadError: (error: string) => void;
  onProcessingChange: (isProcessing: boolean) => void;
  isProcessing: boolean;
  error: string | null;
}

export function FileUpload({ 
  onUploadSuccess, 
  onUploadError, 
  onProcessingChange,
  isProcessing,
  error 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiRequest('POST', '/api/upload', formData);
      return response.json();
    },
    onSuccess: (data: ProcessedOutput) => {
      onUploadSuccess(data);
      setUploadProgress(0);
      onProcessingChange(false);
      toast({
        title: "Upload successful!",
        description: "Your codebase has been processed and is ready to view.",
      });
    },
    onError: (error: Error) => {
      onUploadError(error.message);
      setUploadProgress(0);
      onProcessingChange(false);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    // Validate file type
    if (!file.type.includes('zip') && !file.name.toLowerCase().endsWith('.zip')) {
      onUploadError('Please select a ZIP file');
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      onUploadError('File size must be less than 100MB');
      return;
    }

    onProcessingChange(true);
    onUploadError(null);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    uploadMutation.mutate(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const retryUpload = () => {
    onUploadError(null);
    setUploadProgress(0);
    onProcessingChange(false);
  };

  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Upload Your Codebase</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Drop your ZIP archive here or click to select. We'll extract and format your entire project structure for easy AI consumption.
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer group ${
            dragActive 
              ? 'border-blue-400 bg-blue-50/50' 
              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
          } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".zip"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          
          <div className="flex flex-col items-center space-y-4">
            <div className={`rounded-full p-4 transition-colors ${
              dragActive ? 'bg-blue-200' : 'bg-blue-100 group-hover:bg-blue-200'
            }`}>
              <CloudUpload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-900 mb-1">Drop your ZIP file here</p>
              <p className="text-slate-500">or <span className="text-blue-600 font-medium">click to browse</span></p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Max 100MB
              </span>
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                ZIP files only
              </span>
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Secure processing
              </span>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadMutation.isPending && uploadProgress < 90 && (
          <div className="mt-6">
            <Progress value={uploadProgress} className="h-2" />
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-slate-600">Uploading archive...</span>
              <span className="text-slate-800 font-medium">{Math.round(uploadProgress)}%</span>
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && uploadProgress >= 90 && (
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-blue-800 font-medium">Processing archive...</span>
            </div>
            <div className="mt-4 space-y-2">
              <ProcessingStep completed={true} text="Extracting archive contents" />
              <ProcessingStep completed={true} text="Building file tree structure" />
              <ProcessingStep completed={false} current={true} text="Reading file contents" />
              <ProcessingStep completed={false} text="Formatting output" />
            </div>
          </div>
        )}

        {/* Error Handling */}
        {error && (
          <div className="mt-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-2">Processing Error</p>
                  <p className="text-sm">{error}</p>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2" />
                      Ensure your ZIP file is not corrupted
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2" />
                      File size must be under 100MB
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2" />
                      Only ZIP archives are supported
                    </div>
                  </div>
                </div>
                <Button onClick={retryUpload} size="sm" className="ml-4">
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProcessingStepProps {
  completed: boolean;
  current?: boolean;
  text: string;
}

function ProcessingStep({ completed, current = false, text }: ProcessingStepProps) {
  return (
    <div className="flex items-center space-x-3 text-sm">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        completed 
          ? 'bg-emerald-500' 
          : current 
            ? 'border-2 border-blue-600' 
            : 'border-2 border-slate-300'
      }`}>
        {completed ? (
          <Check className="w-3 h-3 text-white" />
        ) : current ? (
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
        ) : null}
      </div>
      <span className={completed || current ? 'text-slate-700' : 'text-slate-500'}>
        {text}
      </span>
    </div>
  );
}
