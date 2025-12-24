import { motion } from "framer-motion";
import { MessageActionsProps } from "../../types";
import {
  CopyIcon,
  RegenerateIcon,
  LikeIcon,
  DislikeIcon,
  BranchIcon,
} from "../common/Icons";

export function MessageActions({
  isCurrentUser,
  feedback,
  onCopy,
  onRegenerate,
  onLike,
  onDislike,
  onBranch,
}: MessageActionsProps) {
  return (
    <div className="message-actions">
      <motion.button
        className="message-action-btn"
        onClick={onCopy}
        title="Copy"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <CopyIcon />
      </motion.button>

      {!isCurrentUser && onRegenerate && (
        <motion.button
          className="message-action-btn"
          onClick={onRegenerate}
          title="Regenerate"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <RegenerateIcon />
        </motion.button>
      )}

      {!isCurrentUser && (
        <>
          <motion.button
            className={`message-action-btn ${feedback === 'liked' ? 'liked' : ''}`}
            onClick={onLike}
            title="Like"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <LikeIcon />
          </motion.button>
          <motion.button
            className={`message-action-btn ${feedback === 'disliked' ? 'disliked' : ''}`}
            onClick={onDislike}
            title="Dislike"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <DislikeIcon />
          </motion.button>
        </>
      )}

      {onBranch && (
        <motion.button
          className="message-action-btn"
          onClick={onBranch}
          title="Create branch"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <BranchIcon />
        </motion.button>
      )}
    </div>
  );
}
