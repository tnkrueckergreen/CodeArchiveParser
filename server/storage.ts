import { uploads, processedFiles, type Upload, type InsertUpload, type ProcessedFile, type InsertProcessedFile } from "@shared/schema";

export interface IStorage {
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: number): Promise<Upload | undefined>;
  createProcessedFile(processedFile: InsertProcessedFile): Promise<ProcessedFile>;
  getProcessedFile(uploadId: number): Promise<ProcessedFile | undefined>;
}

export class MemStorage implements IStorage {
  private uploads: Map<number, Upload>;
  private processedFiles: Map<number, ProcessedFile>;
  private currentUploadId: number;
  private currentProcessedId: number;

  constructor() {
    this.uploads = new Map();
    this.processedFiles = new Map();
    this.currentUploadId = 1;
    this.currentProcessedId = 1;
  }

  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const id = this.currentUploadId++;
    const upload: Upload = { 
      ...insertUpload, 
      id,
      uploadedAt: new Date()
    };
    this.uploads.set(id, upload);
    return upload;
  }

  async getUpload(id: number): Promise<Upload | undefined> {
    return this.uploads.get(id);
  }

  async createProcessedFile(insertProcessedFile: InsertProcessedFile): Promise<ProcessedFile> {
    const id = this.currentProcessedId++;
    const processedFile: ProcessedFile = {
      ...insertProcessedFile,
      id,
      processedAt: new Date()
    };
    this.processedFiles.set(id, processedFile);
    return processedFile;
  }

  async getProcessedFile(uploadId: number): Promise<ProcessedFile | undefined> {
    return Array.from(this.processedFiles.values()).find(
      (file) => file.uploadId === uploadId
    );
  }
}

export const storage = new MemStorage();
