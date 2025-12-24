import { motion } from "framer-motion";
import { TypingIndicatorProps } from "../../types";

export function TypingIndicator({ show = true }: TypingIndicatorProps) {
  if (!show) return null;

  return (
    <motion.div
      className="typing-indicator"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="typing-dot"
          initial={{ opacity: 0.3, y: 0 }}
          animate={{
            opacity: [0.3, 1, 0.3],
            y: [0, -6, 0],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}
