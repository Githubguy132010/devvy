import { motion } from "framer-motion";

export function Settings() {
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
