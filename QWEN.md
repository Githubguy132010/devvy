# Devvy - Tauri + React + TypeScript Desktop AI Chat Application

## Project Overview

Devvy is a Tauri-powered desktop AI chat application built with React and TypeScript. It features a glassmorphism-styled chat interface with message branching, code panels, markdown rendering, and toast notifications. The application is designed as a modern desktop chat interface with advanced features for AI conversations.

**Tech Stack:**
- Tauri v2 (Rust backend + desktop framework)
- React 19 + TypeScript
- Vite 7 (build tool)
- Framer Motion (animations)
- react-markdown + react-syntax-highlighter
- Bun (package manager)

## Architecture

### Frontend Structure

```
src/
├── components/
│   ├── chat/          # Core chat UI (Message, BranchMenu, CodeBlock, etc.)
│   ├── common/        # Reusable components (Toast, IconButton, LoadingSpinner)
│   ├── dialogs/       # Modal dialogs (ConfirmDialog, RenameDialog)
│   └── layout/        # Layout components (Sidebar, ChatView, Settings, SplitView)
├── hooks/             # Custom React hooks (useMessageBranching, useToast)
├── utils/             # Pure utilities (markdown, time, clipboard)
└── types/             # Centralized TypeScript types
```

### Key Architectural Patterns

**State Management:** All application state is lifted to `App.tsx`. Components receive data via props and use callbacks to communicate upward.

**Type-First Development:** All types are centralized in `src/types/index.ts`. Component props interfaces are exported alongside their components.

**Custom Hooks:** Stateful logic is encapsulated in hooks:
- `useMessageBranching`: Manages message branching state and operations
- `useToast`: Manages toast notifications with auto-dismiss

**Component Organization:** Components are grouped by function, not by UI element type. Each component is self-contained with its own props interface.

### Design System

The app uses a **glassmorphism** design system with:
- CSS variables defined in `:root` for consistent styling
- `backdrop-filter: blur()` for glass effects
- Framer Motion for all animations (use motion components, not HTML elements)
- Circulating glow keyframe animations
- Consistent color scheme: black background, gray text, blue accent (#5a9bff)

**When adding UI:**
- Use Framer Motion's `motion.*` components for all animated elements
- Wrap exit animations with `AnimatePresence`
- Use glassmorphism styles defined in CSS variables
- Follow existing hover/active state patterns

### Tauri Integration

The Rust backend is in `src-tauri/src/`. Currently, it has minimal functionality with only a `greet` command as a placeholder.

**Important:** The frontend uses a `simulateAIResponse` function as a placeholder. This would need to be replaced with actual API calls to AI services.

### Key Files

- `src/App.tsx` (388 lines): Main application component with all state management
- `src/types/index.ts`: All TypeScript type definitions
- `src/App.css` (1565 lines): Global styles and CSS variables
- `vite.config.ts`: Vite configuration (port 1420 for Tauri)
- `src-tauri/tauri.conf.json`: Tauri app configuration

### Message Branching System

The app supports creating, switching, and merging message branches:
- Each branch has a status: active, inactive, or merged
- Branches are visualized with indicators in the chat
- Branch operations are handled by `useMessageBranching` hook

## Building and Running

### Prerequisites
- [Bun](https://bun.sh/) package manager
- Rust (for Tauri backend)

### Development Commands

```bash
bun run dev              # Start Vite development server (http://localhost:1420)
bun run build            # TypeScript compile + Vite production build
bun run preview          # Preview production build
bun run tauri dev        # Run Tauri app in development mode
bun run tauri build      # Build Tauri desktop application
```

### Project Structure
- `src/` - Frontend React/TypeScript source code
- `src-tauri/` - Tauri backend Rust code
- `public/` - Static assets
- `dist/` - Production build output
- `node_modules/` - Dependencies

## Development Conventions

### Code Style
- TypeScript strict mode is enabled
- All components use TypeScript interfaces for props
- CSS variables are used for consistent theming
- Framer Motion is used for all animations

### Testing
- No explicit test files were found in the initial structure
- Testing strategy would need to be implemented based on project needs

### Contribution Guidelines
- Follow existing component structure patterns
- Use TypeScript for all new code
- Maintain glassmorphism design consistency
- Use Framer Motion for animations
- Keep state management centralized in App.tsx where appropriate

## Features

- **AI Chat Interface**: Modern chat UI with message history
- **Message Branching**: Ability to create and manage multiple conversation branches
- **Code Panels**: Split view with code panel for code examples
- **Markdown Rendering**: Support for markdown in chat messages
- **Glassmorphism Design**: Modern glass-like UI elements
- **Toast Notifications**: User feedback system
- **Settings Panel**: Application configuration
- **Responsive Layout**: Adapts to different screen sizes

## Configuration Files

- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite build configuration
- `tauri.conf.json`: Tauri application configuration
- `.gitignore`: Git ignore patterns
- `CLAUDE.md`: Claude Code guidance (contains detailed project information)