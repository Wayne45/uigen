# UIGen

An AI-powered React component generator with live preview. Describe components in natural language and watch them come to life instantly.

## Features

- **AI-Powered Generation**: Describe components in plain English using Claude AI
- **Live Preview**: See components render in real-time in an isolated sandbox
- **Virtual File System**: All files managed in-memory with database persistence
- **Code Editor**: View and explore generated component code with syntax highlighting
- **Authentication**: Optional user accounts to save and manage projects
- **Modern Styling**: Components styled with Tailwind CSS utility classes
- **Import Maps**: Automatic module resolution with blob URLs for instant preview
- **Mock Mode**: Works without API key for development and testing

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **AI**: Anthropic Claude API with Vercel AI SDK
- **Database**: Prisma + SQLite
- **Authentication**: JWT with HTTP-only cookies
- **Code Transform**: Babel for JSX/TSX transformation
- **Testing**: Vitest + React Testing Library

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- (Optional) Anthropic API key for AI generation

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/wayne45/uigen.git
cd uigen
```

2. Run the setup command:
```bash
npm run setup
```

This will install dependencies, generate the Prisma client, and run database migrations.

3. (Optional) Create a `.env` file for AI generation:
```env
ANTHROPIC_API_KEY=your-api-key-here
JWT_SECRET=your-secret-key  # Defaults to "development-secret-key"
```

> **Note**: The project works without an API key using a mock provider for testing.

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Start Creating**: Type a component description in the chat input
   - Example: "Create a pricing card with three tiers and a popular badge"
2. **View Live Preview**: Watch your component render in real-time
3. **Explore Code**: Switch to the Code tab to view generated files
4. **Iterate**: Continue chatting to refine and improve your components
5. **Save Projects**: Sign up for an account to save your work

## Development Commands

```bash
# Setup and development
npm run setup              # Initial setup (install + generate + migrate)
npm run dev                # Start dev server with Turbopack
npm run dev:daemon         # Start dev server in background (logs to logs.txt)

# Testing and linting
npm test                   # Run tests with Vitest
npm run lint               # Run ESLint

# Production
npm run build              # Create production build
npm start                  # Start production server

# Database
npx prisma generate        # Regenerate Prisma client
npx prisma migrate dev     # Create and apply migrations
npm run db:reset           # Reset database (force)
npx prisma studio          # Open Prisma Studio GUI
```

## Architecture

### Core System

- **Chat Interface**: Real-time streaming responses from Claude API
- **Virtual File System**: In-memory file tree with JSON serialization to database
- **JSX Transformer**: Babel-powered transformation of JSX/TSX to JavaScript
- **Preview Sandbox**: Isolated iframe with import maps for secure rendering
- **AI Tools**: `str_replace_editor` and `file_manager` for file operations

### Project Structure

```
src/
├── app/                      # Next.js app router
│   ├── api/                 # API routes (chat, auth, projects)
│   ├── auth/                # Authentication pages
│   └── page.tsx             # Home page
├── components/
│   ├── chat/                # Chat interface components
│   ├── code/                # Code editor and file tree
│   ├── preview/             # Preview frame and error handling
│   └── ui/                  # Shared UI components
├── lib/
│   ├── auth.ts              # JWT session management
│   ├── file-system.ts       # Virtual file system implementation
│   ├── provider.ts          # AI provider (Claude/Mock)
│   ├── tools/               # AI tool implementations
│   ├── transform/           # JSX transformation
│   ├── prompts/             # AI generation prompts
│   └── contexts/            # React contexts
├── generated/prisma/        # Generated Prisma client
└── hooks/                   # React hooks

prisma/
├── schema.prisma            # Database schema
└── migrations/              # Database migrations
```

### How It Works

1. User describes a component in the chat interface
2. Request sent to `/api/chat` with virtual file system state
3. Claude AI uses tools to create/edit files
4. Files transformed (JSX → JS) and converted to blob URLs
5. Preview iframe loads component using import maps
6. State persisted to database for authenticated users

## Authentication

- **Anonymous Mode**: Full generation capabilities, no project saving
- **Authenticated Mode**: Save projects, access history, manage multiple projects
- Sessions expire after 7 days

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions:
- Open an [issue on GitHub](https://github.com/wayne45/uigen/issues)
- Check existing [discussions](https://github.com/wayne45/uigen/discussions)
