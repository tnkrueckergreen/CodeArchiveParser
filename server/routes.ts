import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import AdmZip from "adm-zip";
import path from "path";
import fs from "fs";
import { insertUploadSchema, insertProcessedFileSchema, type FileTreeNode, type ProcessingStats } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

// File extensions to include in processing
const ALLOWED_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.cs',
  '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj', '.hs',
  '.html', '.htm', '.css', '.scss', '.sass', '.less', '.xml', '.svg',
  '.json', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.config',
  '.md', '.txt', '.rst', '.adoc', '.tex',
  '.sql', '.sh', '.bat', '.ps1', '.dockerfile', '.gitignore', '.env'
]);

// Directories and files to ignore
const IGNORE_PATTERNS = new Set([
  'node_modules', '.git', '.svn', '.hg', 'dist', 'build', 'target',
  '.next', '.nuxt', 'coverage', '.nyc_output', '.cache', 'logs',
  '__pycache__', '.pytest_cache', '.tox', 'venv', 'env',
  '.DS_Store', 'Thumbs.db', '.vscode', '.idea'
]);

function shouldIgnore(filePath: string): boolean {
  const parts = filePath.split('/');
  return parts.some(part => IGNORE_PATTERNS.has(part) || part.startsWith('.'));
}

function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

function buildFileTree(entries: AdmZip.IZipEntry[]): FileTreeNode[] {
  const root: { [key: string]: any } = {};
  
  // Filter and sort entries
  const validEntries = entries
    .filter(entry => !shouldIgnore(entry.entryName))
    .sort((a, b) => a.entryName.localeCompare(b.entryName));

  // Find common root prefix to remove (usually the ZIP file name)
  let commonPrefix = '';
  if (validEntries.length > 0) {
    const firstPath = validEntries[0].entryName;
    const firstSlash = firstPath.indexOf('/');
    if (firstSlash > 0) {
      const potentialPrefix = firstPath.substring(0, firstSlash + 1);
      if (validEntries.every(entry => entry.entryName.startsWith(potentialPrefix))) {
        commonPrefix = potentialPrefix;
      }
    }
  }

  validEntries.forEach(entry => {
    // Remove common prefix from entry name
    const cleanPath = entry.entryName.startsWith(commonPrefix) 
      ? entry.entryName.substring(commonPrefix.length)
      : entry.entryName;
    
    const parts = cleanPath.split('/').filter(part => part.length > 0);
    if (parts.length === 0) return; // Skip empty paths
    
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        const isFile = index === parts.length - 1 && !entry.isDirectory;
        current[part] = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          type: isFile ? 'file' : 'folder',
          size: isFile ? entry.header.size : undefined,
          extension: isFile ? getFileExtension(part) : undefined,
          children: isFile ? undefined : {}
        };
      }
      if (index < parts.length - 1) {
        current = current[part].children;
      }
    });
  });

  function convertToArray(node: any): FileTreeNode[] {
    return Object.values(node).map((item: any) => ({
      ...item,
      children: item.children ? convertToArray(item.children) : undefined
    }));
  }

  return convertToArray(root);
}

function formatFileContent(filename: string, content: string): string {
  const extension = getFileExtension(filename);
  const language = getLanguageFromExtension(extension);
  
  return `### ${filename}\n\`\`\`${language}\n${content}\n\`\`\`\n\n`;
}

function getLanguageFromExtension(ext: string): string {
  const langMap: { [key: string]: string } = {
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.py': 'python',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.h': 'c',
    '.cs': 'csharp',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.sass': 'sass',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.xml': 'xml',
    '.svg': 'xml',
    '.md': 'markdown',
    '.sql': 'sql',
    '.sh': 'bash',
    '.dockerfile': 'dockerfile'
  };
  
  return langMap[ext] || 'text';
}

function generateFileTreeString(nodes: FileTreeNode[], prefix = '', isLast = true): string {
  let result = '';
  
  nodes.forEach((node, index) => {
    const isLastItem = index === nodes.length - 1;
    const connector = isLastItem ? '└── ' : '├── ';
    const icon = node.type === 'folder' ? '📁 ' : '📄 ';
    
    result += `${prefix}${connector}${icon}${node.name}\n`;
    
    if (node.children && node.children.length > 0) {
      const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
      result += generateFileTreeString(node.children, newPrefix, isLastItem);
    }
  });
  
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload and process ZIP file
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const startTime = Date.now();

      // Create upload record
      const uploadData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      };

      const validatedUpload = insertUploadSchema.parse(uploadData);
      const upload = await storage.createUpload(validatedUpload);

      // Process ZIP file
      const zipPath = req.file.path;
      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();

      // Build file tree
      const fileTree = buildFileTree(entries);

      // Process file contents
      let formattedContent = '# Project Structure and Contents\n\n';
      formattedContent += '## File Tree\n\n```\n';
      formattedContent += generateFileTreeString(fileTree);
      formattedContent += '```\n\n## File Contents\n\n';

      let totalFiles = 0;
      let totalFolders = 0;
      let linesOfCode = 0;

      function processNode(node: FileTreeNode, commonPrefix: string = '') {
        if (node.type === 'folder') {
          totalFolders++;
          if (node.children) {
            node.children.forEach(child => processNode(child, commonPrefix));
          }
        } else {
          totalFiles++;
          const ext = getFileExtension(node.name);
          if (ALLOWED_EXTENSIONS.has(ext)) {
            try {
              // Find entry by matching the original path (with common prefix)
              const originalPath = commonPrefix + node.path;
              const entry = entries.find(e => e.entryName === originalPath || e.entryName.endsWith('/' + node.path));
              if (entry && !entry.isDirectory) {
                const content = entry.getData().toString('utf8');
                if (content.trim()) {
                  formattedContent += formatFileContent(node.path, content);
                  linesOfCode += content.split('\n').length;
                }
              }
            } catch (error) {
              console.error(`Error processing file ${node.path}:`, error);
            }
          }
        }
      }

      // Calculate common prefix for file processing
      let commonPrefix = '';
      if (entries.length > 0) {
        const firstPath = entries[0].entryName;
        const firstSlash = firstPath.indexOf('/');
        if (firstSlash > 0) {
          const potentialPrefix = firstPath.substring(0, firstSlash + 1);
          if (entries.every(entry => entry.entryName.startsWith(potentialPrefix))) {
            commonPrefix = potentialPrefix;
          }
        }
      }

      fileTree.forEach(node => processNode(node, commonPrefix));

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      const fileSize = (req.file.size / (1024 * 1024)).toFixed(1);

      const stats: ProcessingStats = {
        totalFiles,
        totalFolders,
        linesOfCode,
        fileSize: `${fileSize}MB`,
        processingTime: `${processingTime}s`
      };

      // Save processed data
      const processedData = {
        uploadId: upload.id,
        fileTree,
        formattedContent,
        stats
      };

      const validatedProcessed = insertProcessedFileSchema.parse(processedData);
      const processedFile = await storage.createProcessedFile(validatedProcessed);

      // Clean up uploaded file
      fs.unlinkSync(zipPath);

      res.json({
        uploadId: upload.id,
        fileTree,
        formattedContent,
        stats
      });

    } catch (error) {
      console.error('Upload processing error:', error);
      
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'File processing failed' });
      }
    }
  });

  // Get processed file by upload ID
  app.get('/api/processed/:uploadId', async (req, res) => {
    try {
      const uploadId = parseInt(req.params.uploadId);
      const processedFile = await storage.getProcessedFile(uploadId);

      if (!processedFile) {
        return res.status(404).json({ error: 'Processed file not found' });
      }

      res.json({
        fileTree: processedFile.fileTree,
        formattedContent: processedFile.formattedContent,
        stats: processedFile.stats
      });

    } catch (error) {
      console.error('Get processed file error:', error);
      res.status(500).json({ error: 'Failed to retrieve processed file' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
