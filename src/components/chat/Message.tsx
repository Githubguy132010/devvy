import { motion } from "framer-motion";
import { MessageProps } from "../../types";
import { MessageActions } from "./MessageActions";
import { formatMessageTime } from "../../utils/time";

export function Message({
  message,
  isCurrentUser,
  onCopy,
  onRegenerate,
  onFeedback,
  onBranch,
}: MessageProps) {
  const content = message.content;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{
        duration: 0.25,
        layout: { duration: 0.2 }
      }}
      className={`message ${isCurrentUser ? 'user' : 'assistant'} ${message.isStreaming ? 'streaming' : ''}`}
    >
      <MessageActions
        isCurrentUser={isCurrentUser}
        feedback={message.feedback || null}
        onCopy={() => onCopy(content)}
        onRegenerate={onRegenerate ? () => onRegenerate(message.id) : undefined}
        onLike={onFeedback ? () => onFeedback(message.id, 'liked') : () => {}}
        onDislike={onFeedback ? () => onFeedback(message.id, 'disliked') : () => {}}
        onBranch={onBranch ? () => onBranch(message.id) : undefined}
      />
      <span className="message-content">{content}</span>
      <span className="message-timestamp">{formatMessageTime(message.timestamp)}</span>
    </motion.div>
  );
}
