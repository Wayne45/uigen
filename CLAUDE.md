# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, and Claude generates React components using a virtual file system. Components are displayed in real-time in an isolated preview iframe.

## Development Commands

### Setup
```bash
npm run setup
```
Installs dependencies, generates Prisma client, and runs database migrations. Run this first on a fresh clone.

### Development
```bash
npm run dev              # Start dev server with Turbopack
npm run dev:daemon       # Start dev server in background, logs to logs.txt
```
Starts Next.js dev server on http://localhost:3000.

### Testing
```bash
npm test                 # Run all tests with Vitest
```
Uses Vitest with jsdom environment. Tests are colocated in `__tests__` directories.

### Database
```bash
npx prisma generate      # Regenerate Prisma client after schema changes
npx prisma migrate dev   # Create and apply new migrations
npm run db:reset         # Reset database (force)
```

### Other
```bash
npm run build            # Production build
npm start                # Start production server
npm run lint             # Run ESLint
```

## Architecture

### AI Code Generation System

The core AI generation flow works as follows:

1. **API Route** (`src/app/api/chat/route.ts`): Accepts messages and virtual file system state, streams responses from Claude
2. **Virtual File System** (`src/lib/file-system.ts`): In-memory file system that tracks all generated files without touching disk
3. **AI Tools**: Claude uses two tools to manipulate the virtual file system:
   - `str_replace_editor` (`src/lib/tools/str-replace.ts`): Create, view, and edit files using string replacement
   - `file_manager` (`src/lib/tools/file-manager.ts`): Rename and delete files/directories
4. **AI Provider** (`src/lib/provider.ts`): Falls back to MockLanguageModel when ANTHROPIC_API_KEY is not set
5. **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`): Transforms JSX/TSX to JS using Babel, creates import maps with blob URLs, handles missing imports with placeholders
6. **Preview Frame** (`src/components/preview/PreviewFrame.tsx`): Sandboxed iframe that displays generated components using import maps

### Virtual File System

The `VirtualFileSystem` class maintains an in-memory tree structure of files and directories. Key methods:
- `createFile()`, `updateFile()`, `deleteFile()`, `rename()`: File operations
- `serialize()` / `deserializeFromNodes()`: Convert to/from JSON for database storage
- `viewFile()`, `replaceInFile()`, `insertInFile()`: Text editor operations used by AI tools

File system state is:
- Passed to/from the chat API as JSON
- Persisted in the `Project.data` field as JSON string
- Transformed to blob URLs for preview rendering

### Authentication & Sessions

JWT-based authentication with HTTP-only cookies:
- `src/lib/auth.ts`: Session management (createSession, getSession, verifySession)
- `src/middleware.ts`: Protects API routes (currently /api/projects, /api/filesystem)
- Anonymous users can use the app but cannot save projects
- Sessions expire after 7 days

### Database Schema

Using Prisma with SQLite (output: `src/generated/prisma`):
- **User**: email, password (bcrypt hashed)
- **Project**: name, userId (nullable), messages (JSON), data (JSON - virtual file system state)

Projects can be anonymous (userId = null) or owned by authenticated users.

### Preview System

Components are rendered in an isolated iframe using:
1. Babel transforms JSX/TSX to JavaScript
2. Import maps map module specifiers to blob URLs
3. External dependencies (react, react-dom) loaded from esm.sh
4. Path aliases supported: `@/` maps to root directory
5. Tailwind CSS loaded via CDN
6. CSS files collected and injected as `<style>` tags
7. Syntax errors displayed in a formatted error UI

Entry point detection (in order): /App.jsx, /App.tsx, /index.jsx, /index.tsx, /src/App.jsx, /src/App.tsx, or first .jsx/.tsx file.

### Key Patterns

**Path Resolution:**
- Files stored with leading slash (e.g., "/App.jsx")
- Import map includes variations: with/without leading slash, with/without extension, @/ aliases
- Missing imports create placeholder modules to prevent errors

**Error Handling:**
- Transform errors caught per-file and displayed in preview
- Runtime errors caught by React ErrorBoundary in preview iframe
- Mock provider returns static responses when ANTHROPIC_API_KEY is missing

**State Management:**
- FileSystemContext (`src/lib/contexts/file-system-context.tsx`) provides global access to virtual file system
- Messages and file system state persisted to database on chat completion (if authenticated)

## Environment Variables

Create `.env` file:
```
ANTHROPIC_API_KEY=your-api-key-here  # Optional - uses mock provider without it
JWT_SECRET=your-secret-key           # Defaults to "development-secret-key"
```

## Important Notes

- Prisma client generated to `src/generated/prisma` (not default `node_modules/.prisma`)
- Preview uses blob URLs and import maps (requires modern browser)
- All file operations are in-memory; nothing written to disk during generation
- Tests use Vitest (not Jest) with React Testing Library
- Use comments sparingly. Only comment complex code.
- The database schema is defined in the @prisma/schema.prisma file. Reference it anytime you need to understand the structure of data stored in the database.
- Add logs before start to fix the issue.