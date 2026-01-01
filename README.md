# Devvy - Tauri Chat Application

Devvy is a modern desktop chat application built with Tauri, React, and TypeScript. It provides a fast and lightweight user experience with powerful chat functionalities.

## 🚀 Features

- **Chat Interface**: Modern and responsive chat UI with code block support
- **Message Branching**: Advanced message branching with branch indicators and menus
- **Code Highlight**: Syntax highlighting for code blocks in chat messages
- **Toast Notifications**: Elegant notifications for user feedback
- **Dialogs**: Built-in dialogs for confirmations and renaming
- **Split View**: Flexible layout with sidebar and main chat view
- **Cross-platform**: Support for Windows, macOS, Linux, and Android

## 🛠 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimization
- **Desktop Runtime**: Tauri 2.x for native desktop applications
- **Styling**: CSS Modules with custom components
- **State Management**: React Hooks and context
- **Mobile Support**: Android build via Tauri

## 📁 Project Structure

```
devvy/
├── src/                    # React frontend source files
│   ├── assets/            # Static assets (images, icons)
│   ├── components/        # React components
│   │   ├── chat/         # Chat-related components
│   │   │   ├── BranchIndicator.tsx
│   │   │   ├── BranchMenu.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── Message.tsx
│   │   │   ├── MessageActions.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── common/       # Reusable common components
│   │   │   ├── IconButton.tsx
│   │   │   ├── Icons.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ToastContainer.tsx
│   │   ├── dialogs/      # Dialog components
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── RenameDialog.tsx
│   │   └── layout/       # Layout components
│   │       ├── ChatView.tsx
│   │       ├── Settings.tsx
│   │       ├── Sidebar.tsx
│   │       └── SplitView.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useMessageBranching.ts
│   │   └── useToast.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── clipboard.ts
│   │   ├── markdown.ts
│   │   └── time.ts
│   ├── App.css           # Main application styles
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── src-tauri/            # Tauri backend source files
│   ├── src/              # Rust source code
│   │   ├── lib.rs
│   │   └── main.rs
│   ├── capabilities/     # Tauri capabilities configuration
│   ├── gen/              # Generated files
│   │   ├── android/     # Android build configuration
│   │   └── schemas/     # JSON schemas
│   ├── icons/           # Application icons
│   ├── build.rs         # Build script
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
├── public/              # Public static files
├── index.html           # HTML entry point
├── package.json         # NPM dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tsconfig.node.json   # TypeScript Node configuration
└── vite.config.ts       # Vite configuration
```

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Rust and Cargo (for Tauri)
- Android Studio (optional for Android build)

### Install Dependencies

```bash
# Install frontend dependencies
bun install
```

## 🏃 Development

### Frontend Development Server

Start the Vite development server:

```bash
bun run dev
```

This starts the React application at `http://localhost:1420` (or another available port).

### Tauri Development

Start the Tauri application in development mode:

```bash
bun run tauri dev
```

This opens the native Tauri window with hot-reload support.

### TypeScript Check

Check for TypeScript errors:

```bash
bun run typecheck
```

## 🔨 Production Build

### Desktop Build

Build the application for desktop platforms:

```bash
# Build for all platforms
bun run build

# Specifically for Windows
bun run build:windows

# Specifically for macOS
bun run build:macos

# Specifically for Linux
bun run build:linux
```

### Android Build

Build for Android (requires Android Studio and SDK):

```bash
cd src-tauri
bun run android
```

## ⚙️ Configuration

### Tauri Configuration

The Tauri configuration is located in [`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json). Here you can:

- Adjust application name and version
- Modify window configuration
- Set permissions
- Configure bundler options

### Environment Variables

Create a `.env` file in the root for environment-specific configuration:

```env
VITE_API_ENDPOINT=https://api.example.com
VITE_FEATURES_ENABLED=true
```

## 🎨 Components

### Chat Components

| Component | Description |
|-----------|-------------|
| [`BranchIndicator`](src/components/chat/BranchIndicator.tsx) | Shows current branch status |
| [`BranchMenu`](src/components/chat/BranchMenu.tsx) | Menu for branch navigation |
| [`CodeBlock`](src/components/chat/CodeBlock.tsx) | Code block display with syntax highlighting |
| [`Message`](src/components/chat/Message.tsx) | Single chat message component |
| [`MessageActions`](src/components/chat/MessageActions.tsx) | Action buttons per message |
| [`TypingIndicator`](src/components/chat/TypingIndicator.tsx) | Animation for typing indicator |

### Common Components

| Component | Description |
|-----------|-------------|
| [`IconButton`](src/components/common/IconButton.tsx) | Reusable icon button |
| [`Icons`](src/components/common/Icons.tsx) | Icon library |
| [`LoadingSpinner`](src/components/common/LoadingSpinner.tsx) | Loading animation |
| [`Toast`](src/components/common/Toast.tsx) | Toast notification |
| [`ToastContainer`](src/components/common/ToastContainer.tsx) | Container for toast messages |

### Dialog Components

| Component | Description |
|-----------|-------------|
| [`ConfirmDialog`](src/components/dialogs/ConfirmDialog.tsx) | Confirmation dialog |
| [`RenameDialog`](src/components/dialogs/RenameDialog.tsx) | Dialog for renaming |

### Layout Components

| Component | Description |
|-----------|-------------|
| [`ChatView`](src/components/layout/ChatView.tsx) | Main chat view |
| [`Settings`](src/components/layout/Settings.tsx) | Settings page |
| [`Sidebar`](src/components/layout/Sidebar.tsx) | Sidebar navigation |
| [`SplitView`](src/components/layout/SplitView.tsx) | Split pane layout |

## 🪝 Custom Hooks

- [`useMessageBranching`](src/hooks/useMessageBranching.ts): Manage message branching
- [`useToast`](src/hooks/useToast.ts): Toast notifications state management

## 📝 Utility Functions

- [`clipboard.ts`](src/utils/clipboard.ts): Clipboard operations
- [`markdown.ts`](src/utils/markdown.ts): Markdown parsing and rendering
- [`time.ts`](src/utils/time.ts): Date and time formatting

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) for the excellent desktop framework
- [React](https://reactjs.org/) for the UI framework
- [Vite](https://vitejs.dev/) for the fast build tool
- [TypeScript](https://www.typescriptlang.org/) for type safety
