import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const processedFiles = pgTable("processed_files", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").notNull(),
  fileTree: json("file_tree").notNull(),
  formattedContent: text("formatted_content").notNull(),
  stats: json("stats").notNull(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
});

export const insertUploadSchema = createInsertSchema(uploads).pick({
  filename: true,
  originalName: true,
  fileSize: true,
  mimeType: true,
});

export const insertProcessedFileSchema = createInsertSchema(processedFiles).pick({
  uploadId: true,
  fileTree: true,
  formattedContent: true,
  stats: true,
});

export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Upload = typeof uploads.$inferSelect;
export type InsertProcessedFile = z.infer<typeof insertProcessedFileSchema>;
export type ProcessedFile = typeof processedFiles.$inferSelect;

// Frontend types
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  size?: number;
  extension?: string;
}

export interface ProcessingStats {
  totalFiles: number;
  totalFolders: number;
  linesOfCode: number;
  fileSize: string;
  processingTime: string;
}

export interface ProcessedOutput {
  fileTree: FileTreeNode[];
  formattedContent: string;
  stats: ProcessingStats;
}
