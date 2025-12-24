import { motion } from "framer-motion";
import { LLMConfig, LLMProvider } from "../../types";
import { getAvailableModels, getProviderDisplayName, requiresApiKey } from "../../services/llmService";

export interface SettingsProps {
  llmConfig: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
}

export function Settings({ llmConfig, onConfigChange }: SettingsProps) {
  const providers: LLMProvider[] = ["openai", "anthropic", "google", "ollama"];

  const handleProviderChange = (provider: LLMProvider) => {
    onConfigChange({
      ...llmConfig,
      provider,
    });
  };

  const handleApiKeyChange = (apiKey: string) => {
    onConfigChange({
      ...llmConfig,
      apiKey: apiKey || undefined,
    });
  };

  const handleModelChange = (model: string) => {
    onConfigChange({
      ...llmConfig,
      model: model || undefined,
    });
  };

  const handleTemperatureChange = (temperature: string) => {
    const temp = parseFloat(temperature);
    onConfigChange({
      ...llmConfig,
      temperature: isNaN(temp) ? undefined : temp,
    });
  };

  const handleMaxTokensChange = (maxTokens: string) => {
    const tokens = parseInt(maxTokens);
    onConfigChange({
      ...llmConfig,
      maxTokens: isNaN(tokens) ? undefined : tokens,
    });
  };

  const handleBaseUrlChange = (baseUrl: string) => {
    onConfigChange({
      ...llmConfig,
      baseUrl: baseUrl || undefined,
    });
  };

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
        <h2>LLM Provider</h2>
        
        <motion.div
          className="setting-item"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <label>
            <span className="setting-label">Provider</span>
            <select
              className="setting-input"
              value={llmConfig.provider}
              onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
            >
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {getProviderDisplayName(provider)}
                </option>
              ))}
            </select>
          </label>
        </motion.div>

        {requiresApiKey(llmConfig.provider) && (
          <motion.div
            className="setting-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <label>
              <span className="setting-label">API Key</span>
              <input
                type="password"
                className="setting-input"
                value={llmConfig.apiKey || ""}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder={`Enter your ${getProviderDisplayName(llmConfig.provider)} API key`}
              />
            </label>
          </motion.div>
        )}

        <motion.div
          className="setting-item"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <label>
            <span className="setting-label">Model</span>
            <select
              className="setting-input"
              value={llmConfig.model || ""}
              onChange={(e) => handleModelChange(e.target.value)}
            >
              <option value="">Default</option>
              {getAvailableModels(llmConfig.provider).map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>
        </motion.div>

        <motion.div
          className="setting-item"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <label>
            <span className="setting-label">Temperature (0-2)</span>
            <input
              type="number"
              className="setting-input"
              value={llmConfig.temperature ?? ""}
              onChange={(e) => handleTemperatureChange(e.target.value)}
              placeholder="0.7"
              step="0.1"
              min="0"
              max="2"
            />
          </label>
        </motion.div>

        <motion.div
          className="setting-item"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <label>
            <span className="setting-label">Max Tokens</span>
            <input
              type="number"
              className="setting-input"
              value={llmConfig.maxTokens ?? ""}
              onChange={(e) => handleMaxTokensChange(e.target.value)}
              placeholder="4096"
              step="100"
              min="1"
            />
          </label>
        </motion.div>

        {llmConfig.provider === "ollama" && (
          <motion.div
            className="setting-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <label>
              <span className="setting-label">Base URL</span>
              <input
                type="text"
                className="setting-input"
                value={llmConfig.baseUrl || ""}
                onChange={(e) => handleBaseUrlChange(e.target.value)}
                placeholder="http://localhost:11434"
              />
            </label>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="settings-section"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.45 }}
      >
        <h2>Chat</h2>
        <motion.div
          className="setting-item"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
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
          transition={{ duration: 0.3, delay: 0.55 }}
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
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <h2>Keyboard Shortcuts</h2>
        <div className="shortcut-list">
          <motion.div
            className="shortcut-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.65 }}
          >
            <span className="shortcut-action">Send message</span>
            <span className="shortcut-key">Enter</span>
          </motion.div>
          <motion.div
            className="shortcut-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
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
        transition={{ duration: 0.3, delay: 0.75 }}
      >
        <h2>About</h2>
        <div className="about-info">
          <p>Devvy v1.0.0</p>
          <p>A Tauri-powered desktop application with LLM support</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
