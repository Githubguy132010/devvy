import { useState, useRef, useEffect } from "react";
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

interface RenameDialogProps {
  isOpen: boolean;
  currentTitle: string;
  onConfirm: (newTitle: string) => void;
  onCancel: () => void;
}

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog">
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
      </div>
    </div>
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

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
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
      </div>
    </div>
  );
}

function App() {
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
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewChat}>
            + New Chat
          </button>
        </div>
        <div className="chat-history">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
              onClick={() => switchChat(chat.id)}
            >
              <span className="chat-title">{chat.title || generateChatTitle(chat.messages)}</span>
              <div className="chat-actions">
                <button
                  className="rename-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    renameChat(chat.id);
                  }}
                  title="Rename chat"
                >
                  ✏
                </button>
                <button
                  className="delete-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  title="Delete chat"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="main-content">
        <h1>Devvy</h1>

        <div className="messages-container">
          {!currentChatId ? (
            <p className="placeholder">Select a chat or create a new one to get started...</p>
          ) : currentMessages.length === 0 ? (
            <p className="placeholder">Send a message to get started...</p>
          ) : (
            currentMessages.map((msg, index) => (
              <div key={index} className="message">
                <span className="message-content">{msg}</span>
              </div>
            ))
          )}
        </div>

        <form className="prompt-form" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
          />
          <button type="submit" className="send-btn">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
</button>
        </form>
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
