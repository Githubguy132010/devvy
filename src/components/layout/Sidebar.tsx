import { motion, AnimatePresence } from "framer-motion";
import { Chat } from "../../types";

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  currentView: 'chat' | 'settings';
  onNewChat: () => void;
  onSwitchChat: (chatId: string) => void;
  onRenameChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onToggleSettings: () => void;
}

export function Sidebar({
  chats,
  currentChatId,
  currentView,
  onNewChat,
  onSwitchChat,
  onRenameChat,
  onDeleteChat,
  onToggleSettings,
}: SidebarProps) {
  function generateChatTitle(messages: string[]): string {
    if (messages.length === 0) return "New Chat";
    const firstMessage = messages[0];
    return firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage;
  }

  return (
    <aside className="sidebar">
      <motion.div
        className="sidebar-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          className="new-chat-btn"
          onClick={onNewChat}
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
              onClick={() => onSwitchChat(chat.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="chat-title">{chat.title || generateChatTitle(chat.messages.map(m => typeof m === 'string' ? m : m.content))}</span>
              <div className="chat-actions">
                <motion.button
                  className="rename-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameChat(chat.id);
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
                    onDeleteChat(chat.id);
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
          onClick={onToggleSettings}
          title="Settings"
          whileHover={{ scale: 1.1, rotate: 30 }}
          whileTap={{ scale: 0.9 }}
        >
          ⚙
        </motion.button>
      </motion.div>
    </aside>
  );
}
