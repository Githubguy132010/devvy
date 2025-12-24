// Core Types
export type MessageRole = 'user' | 'assistant' | 'system';
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type BranchStatus = 'active' | 'inactive' | 'merged';
export type View = 'chat' | 'settings';
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'ollama';

// LLM Provider Types
export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string; // For Ollama or custom endpoints
  temperature?: number;
  maxTokens?: number;
}

export interface LLMMessage {
  role: MessageRole;
  content: string;
}

export interface LLMResponse {
  content: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Hook Return Types
export interface UseToastReturn {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export interface UseMessageBranchingReturn {
  branches: Branch[];
  activeBranchId: string;
  createBranch: (messageId: string) => void;
  switchBranch: (branchId: string) => void;
  deleteBranch: (branchId: string) => void;
  mergeBranch: (branchId: string) => void;
}

// Message Types
export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: string;
  isStreaming?: boolean;
  feedback?: 'liked' | 'disliked' | null;
  branchId?: string;
  messageId?: string;
}

// Branch Types
export interface Branch {
  id: string;
  chatId: string;
  forkedFromMessageId: string;
  messages: Message[];
  status: BranchStatus;
  createdAt: string;
}

// Chat Types
export interface Chat {
  id: string;
  title: string;
  messages: (Message | string)[];
  branches: Branch[];
  currentBranchId?: string;
  createdAt?: string;
}

// Toast Types
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Split View Types
export interface SplitViewState {
  isEnabled: boolean;
  codePanel?: string;
  showBoth: boolean;
}

// Dialog Props Types
export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface RenameDialogProps {
  isOpen: boolean;
  currentTitle: string;
  onConfirm: (newTitle: string) => void;
  onCancel: () => void;
}

// Message Action Types
export interface MessageAction {
  type: 'copy' | 'regenerate' | 'like' | 'dislike' | 'branch' | 'delete';
  label: string;
  icon: string;
}

// Component Prop Types
export interface MessageProps {
  message: Message;
  isCurrentUser: boolean;
  onCopy: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: 'liked' | 'disliked') => void;
  onBranch?: (messageId: string) => void;
}

export interface MessageActionsProps {
  isCurrentUser: boolean;
  feedback: 'liked' | 'disliked' | null;
  onCopy: () => void;
  onRegenerate?: () => void;
  onLike: () => void;
  onDislike: () => void;
  onBranch?: () => void;
}

export interface TypingIndicatorProps {
  show?: boolean;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export interface ToastProps {
  toast: Toast;
  onDismiss: () => void;
}

export interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export interface CodeBlockProps {
  language: string;
  code: string;
  onCopy: (code: string) => void;
}

export interface BranchIndicatorProps {
  branch: Branch;
  isActive: boolean;
  onClick: () => void;
}

export interface IconButtonProps {
  icon: string | React.ReactNode;
  onClick: () => void;
  title?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
}

export interface SplitViewProps {
  leftContent: React.ReactNode;
  rightContent?: React.ReactNode;
  showBoth: boolean;
  onToggleSplit: () => void;
  onCopyFromPanel: (panel: 'left' | 'right') => void;
}
