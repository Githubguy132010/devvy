import { motion } from "framer-motion";
import type { Toast, ToastProps } from "../../types";

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <motion.div
      className={`toast ${toast.type}`}
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <span className={`toast-icon ${toast.type}`}>
        {toast.type === 'success' && '✓'}
        {toast.type === 'error' && '✕'}
        {toast.type === 'info' && 'ℹ'}
        {toast.type === 'warning' && '⚠'}
      </span>
      <div className="toast-content">
        <p className="toast-message">{toast.message}</p>
      </div>
      <button
        className="toast-close"
        onClick={() => onDismiss()}
        aria-label="Close toast"
      >
        ×
      </button>
      {toast.duration && (
        <motion.div
          className="toast-progress"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}
