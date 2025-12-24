import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

interface Chat {
  id: string;
  title: string;
  messages: string[];
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

type View = 'chat' | 'settings';

interface RenameDialogProps {
  isOpen: boolean;
  currentTitle: string;
  onConfirm: (newTitle: string) => void;
  onCancel: () => void;
}

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="dialog-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="dialog"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header">
              <h3>{title}</h3>
            </div>
            <div className="dialog-content">
              <p>{message}</p>
            </div>
            <div className="dialog-actions">
              <button className="dialog-btn dialog-btn-cancel" onClick={onCancel}>
                Cancel
              </button>
              <button className="dialog-btn dialog-btn-confirm" onClick={onConfirm}>
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RenameDialog({ isOpen, currentTitle, onConfirm, onCancel }: RenameDialogProps) {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!newTitle.trim()) {
      setError("Please enter a chat name");
      return;
    }
    onConfirm(newTitle.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="dialog-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="dialog"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header">
              <h3>Rename Chat</h3>
            </div>
            <div className="dialog-content">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter new chat name..."
                autoFocus
              />
              {error && <p className="dialog-error">{error}</p>}
            </div>
            <div className="dialog-actions">
              <button className="dialog-btn dialog-btn-cancel" onClick={onCancel}>
                Cancel
              </button>
              <button className="dialog-btn dialog-btn-save" onClick={handleSave}>
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Settings() {
  return (
    <motion.div
      className="settings-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <h1>Settings</h1>

      <motion.div
        className="settings-section"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2>Chat</h2>
        <motion.div
          className="setting-item"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <label>
            <span className="setting-label">Default Chat Name</span>
            <input type="text" className="setting-input" defaultValue="New Chat" />
          </label>
        </motion.div>
        <motion.div
          className="setting-item"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <label className="setting-checkbox-label">
            <input type="checkbox" defaultChecked />
            <span className="setting-label">Auto-generate chat titles</span>
          </label>
        </motion.div>
      </motion.div>

      <motion.div
        className="settings-section"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <h2>Keyboard Shortcuts</h2>
        <div className="shortcut-list">
          <motion.div
            className="shortcut-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <span className="shortcut-action">Send message</span>
            <span className="shortcut-key">Enter</span>
          </motion.div>
          <motion.div
            className="shortcut-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <span className="shortcut-action">New line</span>
            <span className="shortcut-key">Ctrl + Enter</span>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="settings-section"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <h2>About</h2>
        <div className="about-info">
          <p>Devvy v1.0.0</p>
          <p>A Tauri-powered desktop application</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState<View>('chat');
  const [prompt, setPrompt] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; chatId: string | null }>({ isOpen: false, chatId: null });
  const [renameDialog, setRenameDialog] = useState<{ isOpen: boolean; chatId: string | null }>({ isOpen: false, chatId: null });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (prompt.trim()) {
      if (!currentChatId) {
        // Create new chat if none exists
        const newChat: Chat = {
          id: Date.now().toString(),
          title: prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt,
          messages: [prompt]
        };
        setChats([newChat]);
        setCurrentChatId(newChat.id);
      } else {
        // Add message to existing chat
        setChats(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: [...chat.messages, prompt] }
            : chat
        ));
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
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setCurrentView('chat');
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

  function confirmDeleteChat() {
    if (deleteDialog.chatId) {
      setChats(prev => prev.filter(chat => chat.id !== deleteDialog.chatId));
      if (currentChatId === deleteDialog.chatId) {
        setCurrentChatId(null);
      }
    }
    setDeleteDialog({ isOpen: false, chatId: null });
  }

  function cancelDeleteChat() {
    setDeleteDialog({ isOpen: false, chatId: null });
  }

  function renameChat(chatId: string) {
    setRenameDialog({
      isOpen: true,
      chatId: chatId
    });
  }

  function confirmRenameChat(newTitle: string) {
    if (renameDialog.chatId) {
      setChats(prev => prev.map(chat =>
        chat.id === renameDialog.chatId
          ? { ...chat, title: newTitle }
          : chat
      ));
    }
    setRenameDialog({ isOpen: false, chatId: null });
  }

  function cancelRenameChat() {
    setRenameDialog({ isOpen: false, chatId: null });
  }

  function generateChatTitle(messages: string[]): string {
    if (messages.length === 0) return "New Chat";
    const firstMessage = messages[0];
    return firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage;
  }

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
        
        // Set cursor position after the newline
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

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const currentMessages = currentChat?.messages || [];
  const deleteChatTitle = deleteDialog.chatId ? chats.find(c => c.id === deleteDialog.chatId)?.title || "" : "";
  const renameChatTitle = renameDialog.chatId ? chats.find(c => c.id === renameDialog.chatId)?.title || "" : "";

  return (
    <main className="container">
      <aside className="sidebar">
        <motion.div
          className="sidebar-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            className="new-chat-btn"
            onClick={createNewChat}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + New Chat
          </motion.button>
        </motion.div>
        <div className="chat-history">
          <AnimatePresence>
            {chats.map((chat, index) => (
              <motion.div
                key={chat.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05
                }}
                className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
                onClick={() => switchChat(chat.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="chat-title">{chat.title || generateChatTitle(chat.messages)}</span>
                <div className="chat-actions">
                  <motion.button
                    className="rename-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      renameChat(chat.id);
                    }}
                    title="Rename chat"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✏
                  </motion.button>
                  <motion.button
                    className="delete-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    title="Delete chat"
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ×
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <motion.div
          className="sidebar-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <motion.button
            className={`settings-btn ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentView(currentView === 'settings' ? 'chat' : 'settings')}
            title="Settings"
            whileHover={{ scale: 1.1, rotate: 30 }}
            whileTap={{ scale: 0.9 }}
          >
            ⚙
          </motion.button>
        </motion.div>
      </aside>

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
              <Settings />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="chat-view"
            >
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Devvy
              </motion.h1>

              <div className="messages-container">
                {!currentChatId ? (
                  <motion.p
                    className="placeholder"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    Select a chat or create a new one to get started...
                  </motion.p>
                ) : currentMessages.length === 0 ? (
                  <motion.p
                    className="placeholder"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    Send a message to get started...
                  </motion.p>
                ) : (
                  <AnimatePresence initial={false}>
                    {currentMessages.map((msg, index) => (
                      <motion.div
                        key={index}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{
                          duration: 0.25,
                          delay: index * 0.05,
                          layout: { duration: 0.2 }
                        }}
                        className="message"
                      >
                        <span className="message-content">{msg}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              <div className="prompt-form-wrapper">
                <motion.form
                  className="prompt-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <textarea
                    ref={textareaRef}
                    id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                  />
                  <motion.button
                    type="submit"
                    className="send-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </motion.button>
                </motion.form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Chat"
        message={`Are you sure you want to delete "${deleteChatTitle}"? This action cannot be undone.`}
        onConfirm={confirmDeleteChat}
        onCancel={cancelDeleteChat}
      />

      <RenameDialog
        isOpen={renameDialog.isOpen}
        currentTitle={renameChatTitle}
        onConfirm={confirmRenameChat}
        onCancel={cancelRenameChat}
      />
    </main>
  );
}

export default App;
