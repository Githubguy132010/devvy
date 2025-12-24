import { useRef, FormEvent, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chat, Message } from "../../types";
import { Message as MessageComponent } from "../chat/Message";
import { BranchMenu } from "../chat/BranchMenu";
import { TypingIndicator } from "../chat/TypingIndicator";
import { SplitView } from "./SplitView";
import { copyToClipboard } from "../../utils/clipboard";

interface ChatViewProps {
  currentChat: Chat | undefined;
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: (e: FormEvent) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  branches: any[];
  activeBranchId: string;
  showBranchMenu: boolean;
  onCreateBranch: (messageId: string) => void;
  onSwitchBranch: (branchId: string) => void;
  onDeleteBranch: (branchId: string) => void;
  onMergeBranch: (branchId: string, targetBranchId: string) => void;
  onRegenerateMessage: (messageId: string) => void;
  onMessageFeedback: (messageId: string, feedback: 'liked' | 'disliked') => void;
  showSplitView: boolean;
  codePanelContent?: string;
  onToggleSplitView: () => void;
  onCopyFromPanel: (panel: 'left' | 'right') => void;
  isGenerating: boolean;
  showToast: (message: string, type?: any) => void;
}

export function ChatView({
  currentChat,
  prompt,
  setPrompt,
  onSubmit,
  onKeyDown,
  branches,
  activeBranchId,
  showBranchMenu,
  onCreateBranch,
  onSwitchBranch,
  onDeleteBranch,
  onMergeBranch,
  onRegenerateMessage,
  onMessageFeedback,
  showSplitView,
  codePanelContent,
  onToggleSplitView,
  onCopyFromPanel,
  isGenerating,
  showToast,
}: ChatViewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentMessages = currentChat?.messages || [];
  const messagesAreTyped = currentMessages.length > 0 && typeof currentMessages[0] === 'object' && !Array.isArray(currentMessages[0]);

  const handleCopy = async (content: string) => {
    const success = await copyToClipboard(content);
    showToast(success ? "Copied to clipboard" : "Failed to copy", success ? "success" : "error");
  };

  const handleRegenerate = (messageId: string) => {
    onRegenerateMessage(messageId);
  };

  const handleFeedback = (messageId: string, feedback: 'liked' | 'disliked') => {
    onMessageFeedback(messageId, feedback);
  };

  const handleBranch = (messageId: string) => {
    onCreateBranch(messageId);
    showToast("Branch created", "success");
  };

  const renderMessages = () => {
    if (currentMessages.length === 0) {
      return (
        <motion.p
          className="placeholder"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Send a message to get started...
        </motion.p>
      );
    }

    if (!messagesAreTyped) {
      // Legacy string-based messages
      return (currentMessages as string[]).map((msg, index) => (
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
      ));
    }

    // New typed messages with full functionality
    return (currentMessages as Message[]).map((msg, index) => (
      <MessageComponent
        key={msg.id || index}
        message={msg}
        isCurrentUser={msg.role === 'user'}
        onCopy={handleCopy}
        onRegenerate={handleRegenerate}
        onFeedback={handleFeedback}
        onBranch={handleBranch}
      />
    ));
  };

  const chatContent = (
    <div className="chat-view-content">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Devvy
      </motion.h1>

      <div className="messages-container">
        {!currentChat ? (
          <motion.p
            className="placeholder"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Select a chat or create a new one to get started...
          </motion.p>
        ) : (
          <AnimatePresence initial={false}>
            {renderMessages()}
            {isGenerating && <TypingIndicator show />}
          </AnimatePresence>
        )}
      </div>

      <div className="prompt-form-wrapper">
        <motion.form
          className="prompt-form"
          onSubmit={onSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <textarea
            ref={textareaRef}
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.currentTarget.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your message..."
            rows={1}
            disabled={isGenerating}
          />
          <motion.button
            type="submit"
            className="send-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isGenerating}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </motion.button>
        </motion.form>
      </div>

      {showBranchMenu && (
        <AnimatePresence>
          <motion.div
            className="branch-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {/* Handle close */}}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <BranchMenu
                branches={branches}
                activeBranchId={activeBranchId}
                onSelectBranch={onSwitchBranch}
                onDeleteBranch={onDeleteBranch}
                onMergeBranch={onMergeBranch}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="chat-view"
    >
      <SplitView
        leftContent={chatContent}
        rightContent={codePanelContent}
        showBoth={showSplitView}
        onToggleSplit={onToggleSplitView}
        onCopyFromPanel={onCopyFromPanel}
      />
    </motion.div>
  );
}
