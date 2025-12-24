import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RenameDialogProps } from "../../types";

export function RenameDialog({ isOpen, currentTitle, onConfirm, onCancel }: RenameDialogProps) {
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
