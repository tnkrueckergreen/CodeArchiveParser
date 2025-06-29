# CodeArchive Parser

## Overview

CodeArchive Parser is a full-stack web application that allows users to upload ZIP files containing codebases and automatically extracts, processes, and formats the code content for AI consumption. The application provides an intuitive interface to browse the file structure and view the formatted output.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for fast development and building
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **File Processing**: Multer for file uploads, AdmZip for ZIP extraction
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Two main tables - `uploads` and `processed_files`
- **Migrations**: Managed through Drizzle Kit

## Key Components

### File Upload System
- **Purpose**: Handle ZIP file uploads with validation and processing
- **Implementation**: Multer middleware with 100MB file size limit
- **Validation**: Only ZIP files are accepted
- **Processing**: Automatic extraction and code file filtering

### Code Processing Engine
- **Supported Extensions**: JavaScript, TypeScript, Python, Java, C/C++, HTML/CSS, JSON, Markdown, and more
- **Filtering Logic**: Ignores common directories like node_modules, .git, dist, build
- **Output Format**: Structured text format optimized for AI consumption

### File Tree Visualization
- **Interactive Tree**: Expandable/collapsible directory structure
- **File Selection**: Click to highlight files in the formatted output
- **Statistics Display**: Shows processing statistics and file counts

### Storage Abstraction
- **Interface**: IStorage interface for flexible storage backends
- **Current Implementation**: In-memory storage (MemStorage) for development
- **Future-Ready**: Designed to easily switch to database storage

## Data Flow

1. **Upload Phase**: User selects ZIP file → Frontend validates → Multer processes upload
2. **Extraction Phase**: ZIP file extracted → Files filtered by extension and ignore patterns
3. **Processing Phase**: Valid code files processed → File tree structure built → Content formatted
4. **Storage Phase**: Upload metadata and processed results stored
5. **Display Phase**: File tree and formatted content rendered in UI

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@radix-ui/***: UI component primitives
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Database ORM and query builder
- **multer**: File upload handling
- **adm-zip**: ZIP file processing

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Uses Vite dev server with HMR
- **Production**: Serves static files from Express with built frontend
- **Database**: Requires `DATABASE_URL` environment variable

### Replit Integration
- **Development**: Includes Replit-specific plugins and banners
- **Error Handling**: Runtime error overlay for development
- **Cartographer**: Development-time navigation assistance

## Changelog

Changelog:
- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.