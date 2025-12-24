import { invoke } from "@tauri-apps/api/core";
import { LLMConfig, LLMMessage, LLMResponse } from "../types";

export class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /**
   * Send a message to the LLM provider
   */
  async sendMessage(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const response = await invoke<LLMResponse>("send_llm_message", {
        config: this.config,
        messages: messages,
      });
      return response;
    } catch (error) {
      console.error("LLM Service Error:", error);
      throw new Error(`Failed to get response from ${this.config.provider}: ${error}`);
    }
  }

  /**
   * Update the configuration
   */
  updateConfig(newConfig: Partial<LLMConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): LLMConfig {
    return { ...this.config };
  }
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: string): string {
  switch (provider) {
    case "openai":
      return "gpt-4o";
    case "anthropic":
      return "claude-3-5-sonnet-20241022";
    case "google":
      return "gemini-2.0-flash-exp";
    case "ollama":
      return "llama3.2";
    case "custom":
      return "gpt-3.5-turbo";
    default:
      return "gpt-4o";
  }
}

/**
 * Get available models for a provider
 */
export function getAvailableModels(provider: string): string[] {
  switch (provider) {
    case "openai":
      return [
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4-turbo",
        "gpt-4",
        "gpt-3.5-turbo",
      ];
    case "anthropic":
      return [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
      ];
    case "google":
      return [
        "gemini-2.0-flash-exp",
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-1.0-pro",
      ];
    case "ollama":
      return [
        "llama3.2",
        "llama3.1",
        "llama3",
        "mistral",
        "mixtral",
        "codellama",
        "phi3",
        "qwen2.5",
      ];
    case "custom":
      return []; // User can enter any model name
    default:
      return [];
  }
}

/**
 * Check if a provider requires an API key
 */
export function requiresApiKey(provider: string): boolean {
  return provider !== "ollama";
}

/**
 * Check if a provider requires a base URL
 */
export function requiresBaseUrl(provider: string): boolean {
  return provider === "ollama" || provider === "custom";
}

/**
 * Get display name for a provider
 */
export function getProviderDisplayName(provider: string): string {
  switch (provider) {
    case "openai":
      return "OpenAI";
    case "anthropic":
      return "Anthropic (Claude)";
    case "google":
      return "Google (Gemini)";
    case "ollama":
      return "Ollama (Local)";
    case "custom":
      return "Custom (OpenAI Compatible)";
    default:
      return provider;
  }
}

/**
 * Get provider icon path
 */
export function getProviderIcon(provider: string): string {
  switch (provider) {
    case "openai":
      return "/openai.svg";
    case "anthropic":
      return "/anthropic.svg";
    case "google":
      return "/google.svg";
    case "ollama":
      return "/ollama.svg";
    case "custom":
      return "/custom.svg";
    default:
      return "/custom.svg";
  }
}
