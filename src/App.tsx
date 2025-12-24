import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

// Components
import { ConfirmDialog } from "./components/dialogs/ConfirmDialog";
import { RenameDialog } from "./components/dialogs/RenameDialog";
import { Settings } from "./components/layout/Settings";
import { Sidebar } from "./components/layout/Sidebar";
import { ChatView } from "./components/layout/ChatView";
import { ToastContainer } from "./components/common/ToastContainer";

// Types
import { Chat, Message, LLMConfig, LLMMessage } from "./types";

// Utils
import { generateTimestamp } from "./utils/time";

// Services
import { LLMService, getDefaultModel } from "./services/llmService";

// Hooks
import { useToast } from "./hooks/useToast";
import { useMessageBranching } from "./hooks/useMessageBranching";

function App() {
  const [currentView, setCurrentView] = useState<'chat' | 'settings'>('chat');
  const [prompt, setPrompt] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; chatId: string | null }>({ isOpen: false, chatId: null });
  const [renameDialog, setRenameDialog] = useState<{ isOpen: boolean; chatId: string | null }>({ isOpen: false, chatId: null });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // LLM Configuration
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: "openai",
    model: getDefaultModel("openai"),
    temperature: 0.7,
    maxTokens: 4096,
  });
  const [llmService, setLlmService] = useState<LLMService>(new LLMService(llmConfig));

  // Split view state
  const [showSplitView, setShowSplitView] = useState(false);
  const [codePanelContent, setCodePanelContent] = useState<string>("");

  // Generating state for typing indicator
  const [isGenerating, setIsGenerating] = useState(false);

  // Branch menu visibility
  const [showBranchMenu] = useState(false);

  // Toast notifications
  const { showToast, removeToast, toasts } = useToast();

  // Message branching hook
  const {
    branches,
    activeBranchId,
    createBranch,
    switchBranch,
    deleteBranch,
    mergeBranch,
  } = useMessageBranching(currentChatId || "");

  // Update LLM service when config changes
  useEffect(() => {
    setLlmService(new LLMService(llmConfig));
  }, [llmConfig]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  // Helper: Convert legacy messages to Message objects
  function convertToMessage(content: string, role: 'user' | 'assistant'): Message {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      role,
      timestamp: generateTimestamp(),
    };
  }

  // Get LLM response using real API
  async function getLLMResponse(messages: Message[]): Promise<string> {
    setIsGenerating(true);

    try {
      // Convert messages to LLM format
      const llmMessages: LLMMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await llmService.sendMessage(llmMessages);
      
      // If response contains code blocks, extract and set code panel content
      const codeBlockRegex = /```[\s\S]*?```/g;
      const codeBlocks = response.content.match(codeBlockRegex);
      if (codeBlocks && codeBlocks.length > 0) {
        // Remove the backticks and language identifier
        const cleanCode = codeBlocks[0].replace(/```(\w+)?\n?/, '').replace(/```$/, '');
        setCodePanelContent(cleanCode);
      }

      setIsGenerating(false);
      return response.content;
    } catch (error) {
      setIsGenerating(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to get response from LLM";
      showToast(errorMessage, "error", 5000);
      throw error;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (prompt.trim()) {
      if (!currentChatId) {
        // Create new chat if none exists
        const newMessage = convertToMessage(prompt, 'user');
        const newChat: Chat = {
          id: Date.now().toString(),
          title: prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt,
          messages: [newMessage],
          branches: [],
        };
        setChats([newChat]);
        setCurrentChatId(newChat.id);

        // Get LLM response
        getLLMResponse([newMessage]).then(response => {
          const aiMessage = convertToMessage(response, 'assistant');
          setChats(prev => prev.map(chat =>
            chat.id === newChat.id
              ? {
                  ...chat,
                  messages: [...chat.messages, aiMessage],
                }
              : chat
          ));
        }).catch(error => {
          console.error("Failed to get LLM response:", error);
        });
      } else {
        // Add user message to existing chat
        const newMessage = convertToMessage(prompt, 'user');
        const chat = chats.find(c => c.id === currentChatId);
        if (!chat) return;

        setChats(prev => prev.map(chat =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, newMessage],
              }
            : chat
        ));

        // Build message history for context
        const messageHistory = [...chat.messages.filter((m): m is Message => typeof m !== 'string'), newMessage];

        // Get LLM response
        getLLMResponse(messageHistory).then(response => {
          const aiMessage = convertToMessage(response, 'assistant');
          setChats(prev => prev.map(chat =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  messages: [...chat.messages, aiMessage],
                }
              : chat
          ));
        }).catch(error => {
          console.error("Failed to get LLM response:", error);
        });
      }

      setPrompt("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }

  function createNewChat() {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      branches: [],
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setCurrentView('chat');
    showToast("New chat created", "success");
  }

  function switchChat(chatId: string) {
    setCurrentChatId(chatId);
  }

  function deleteChat(chatId: string) {
    setDeleteDialog({
      isOpen: true,
      chatId: chatId
    });
  }

  const confirmDeleteChat = () => {
    if (deleteDialog.chatId) {
      setChats(prev => prev.filter(chat => chat.id !== deleteDialog.chatId));
      if (currentChatId === deleteDialog.chatId) {
        setCurrentChatId(null);
      }
      showToast("Chat deleted", "success");
    }
    setDeleteDialog({ isOpen: false, chatId: null });
  };

  const cancelDeleteChat = () => {
    setDeleteDialog({ isOpen: false, chatId: null });
  };

  function renameChat(chatId: string) {
    setRenameDialog({
      isOpen: true,
      chatId: chatId
    });
  }

  const confirmRenameChat = (newTitle: string) => {
    if (renameDialog.chatId) {
      setChats(prev => prev.map(chat =>
        chat.id === renameDialog.chatId
          ? { ...chat, title: newTitle }
          : chat
      ));
      showToast("Chat renamed", "success");
    }
    setRenameDialog({ isOpen: false, chatId: null });
  };

  const cancelRenameChat = () => {
    setRenameDialog({ isOpen: false, chatId: null });
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift+Enter - allow default behavior (new line)
        return;
      } else if (e.ctrlKey || e.metaKey) {
        // Ctrl+Enter or Cmd+Enter - manually insert newline
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = prompt.substring(0, start) + '\n' + prompt.substring(end);
        setPrompt(newValue);

        // Set cursor position after newline
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
      } else {
        // Enter alone - send message
        e.preventDefault();
        handleSubmit(e as any);
      }
    }
  }

  // Branching handlers
  const handleCreateBranch = (messageId: string) => {
    createBranch(messageId);
  };

  const handleSwitchBranch = (branchId: string) => {
    switchBranch(branchId);
  };

  const handleDeleteBranch = (branchId: string) => {
    deleteBranch(branchId);
    showToast("Branch deleted", "success");
  };

  const handleMergeBranch = (branchId: string, targetBranchId: string) => {
    mergeBranch(branchId, targetBranchId);
    showToast("Branch merged", "success");
  };

  // Message handlers
  const handleRegenerateMessage = (messageId: string) => {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;

    const messageIndex = chat.messages.findIndex((m: any) => m.id === messageId);
    if (messageIndex === -1) return;

    // Get all messages up to (but not including) the message being regenerated
    const messagesUpToRegenerate = chat.messages.slice(0, messageIndex).filter((m): m is Message => typeof m !== 'string');

    if (messagesUpToRegenerate.length > 0) {
      // Regenerate response based on message history
      getLLMResponse(messagesUpToRegenerate).then(response => {
        const regeneratedMessage = convertToMessage(response, 'assistant');
        regeneratedMessage.id = messageId; // Keep same ID to replace

        setChats(prev => prev.map(chat =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: chat.messages.map((msg, idx) =>
                  idx === messageIndex ? regeneratedMessage : msg
                ),
              }
            : chat
        ));

        showToast("Response regenerated", "success");
      }).catch(error => {
        console.error("Failed to regenerate message:", error);
      });
    }
  };

  const handleMessageFeedback = (messageId: string, feedback: 'liked' | 'disliked') => {
    setChats(prev => prev.map(chat =>
      chat.id === currentChatId
        ? {
            ...chat,
            messages: chat.messages.map((msg: any) =>
              msg.id === messageId ? { ...msg, feedback } : msg
            ),
          }
        : chat
    ));
    showToast(feedback === 'liked' ? "Thanks for the feedback!" : "Thanks for letting us know", "success");
  };

  // Split view handlers
  const handleToggleSplitView = () => {
    setShowSplitView(!showSplitView);
  };

  const handleCopyFromPanel = (panel: 'left' | 'right') => {
    if (panel === 'right' && codePanelContent) {
      navigator.clipboard.writeText(codePanelContent);
      showToast("Copied from code panel", "success");
    }
  };

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const deleteChatTitle = deleteDialog.chatId ? chats.find(c => c.id === deleteDialog.chatId)?.title || "" : "";
  const renameChatTitle = renameDialog.chatId ? chats.find(c => c.id === renameDialog.chatId)?.title || "" : "";

  return (
    <main className="container">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        currentView={currentView}
        onNewChat={createNewChat}
        onSwitchChat={switchChat}
        onRenameChat={renameChat}
        onDeleteChat={deleteChat}
        onToggleSettings={() => setCurrentView(currentView === 'settings' ? 'chat' : 'settings')}
      />

      <div className="main-content">
        <AnimatePresence mode="wait">
          {currentView === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <Settings llmConfig={llmConfig} onConfigChange={setLlmConfig} />
            </motion.div>
          ) : (
            <ChatView
              key="chat"
              currentChat={currentChat}
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              branches={branches}
              activeBranchId={activeBranchId}
              showBranchMenu={showBranchMenu}
              onCreateBranch={handleCreateBranch}
              onSwitchBranch={handleSwitchBranch}
              onDeleteBranch={handleDeleteBranch}
              onMergeBranch={handleMergeBranch}
              onRegenerateMessage={handleRegenerateMessage}
              onMessageFeedback={handleMessageFeedback}
              showSplitView={showSplitView}
              codePanelContent={codePanelContent}
              onToggleSplitView={handleToggleSplitView}
              onCopyFromPanel={handleCopyFromPanel}
              isGenerating={isGenerating}
              showToast={showToast}
            />
          )}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Chat"
        message={`Are you sure you want to delete "${deleteChatTitle}"?`}
        onConfirm={confirmDeleteChat}
        onCancel={cancelDeleteChat}
      />

      <RenameDialog
        isOpen={renameDialog.isOpen}
        currentTitle={renameChatTitle}
        onConfirm={confirmRenameChat}
        onCancel={cancelRenameChat}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </main>
  );
}

export default App;
