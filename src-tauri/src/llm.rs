use serde::{Deserialize, Serialize};
use std::error::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMConfig {
    pub provider: String,
    pub api_key: Option<String>,
    pub model: Option<String>,
    pub base_url: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMResponse {
    pub content: String,
    pub model: Option<String>,
    pub usage: Option<Usage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Usage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

// OpenAI API structures
#[derive(Debug, Serialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<OpenAIMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    stream: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct OpenAIResponse {
    choices: Vec<OpenAIChoice>,
    usage: Option<OpenAIUsage>,
    model: Option<String>,
}

#[derive(Debug, Deserialize)]
struct OpenAIChoice {
    message: OpenAIMessage,
}

#[derive(Debug, Deserialize)]
struct OpenAIUsage {
    prompt_tokens: u32,
    completion_tokens: u32,
    total_tokens: u32,
}

// Anthropic API structures
#[derive(Debug, Serialize)]
struct AnthropicRequest {
    model: String,
    messages: Vec<AnthropicMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct AnthropicMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct AnthropicResponse {
    content: Vec<AnthropicContent>,
    usage: Option<AnthropicUsage>,
    model: Option<String>,
}

#[derive(Debug, Deserialize)]
struct AnthropicContent {
    #[serde(rename = "type")]
    content_type: String,
    text: String,
}

#[derive(Debug, Deserialize)]
struct AnthropicUsage {
    input_tokens: u32,
    output_tokens: u32,
}

// Google API structures
#[derive(Debug, Serialize)]
struct GoogleRequest {
    contents: Vec<GoogleContent>,
    #[serde(skip_serializing_if = "Option::is_none")]
    generation_config: Option<GoogleGenerationConfig>,
}

#[derive(Debug, Serialize)]
struct GoogleContent {
    role: String,
    parts: Vec<GooglePart>,
}

#[derive(Debug, Serialize)]
struct GooglePart {
    text: String,
}

#[derive(Debug, Serialize)]
struct GoogleGenerationConfig {
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_output_tokens: Option<u32>,
}

#[derive(Debug, Deserialize)]
struct GoogleResponse {
    candidates: Vec<GoogleCandidate>,
    #[serde(rename = "usageMetadata")]
    usage_metadata: Option<GoogleUsageMetadata>,
}

#[derive(Debug, Deserialize)]
struct GoogleCandidate {
    content: GoogleResponseContent,
}

#[derive(Debug, Deserialize)]
struct GoogleResponseContent {
    parts: Vec<GoogleResponsePart>,
}

#[derive(Debug, Deserialize)]
struct GoogleResponsePart {
    text: String,
}

#[derive(Debug, Deserialize)]
struct GoogleUsageMetadata {
    #[serde(rename = "promptTokenCount")]
    prompt_token_count: u32,
    #[serde(rename = "candidatesTokenCount")]
    candidates_token_count: u32,
    #[serde(rename = "totalTokenCount")]
    total_token_count: u32,
}

// Ollama API structures
#[derive(Debug, Serialize)]
struct OllamaRequest {
    model: String,
    messages: Vec<OllamaMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    options: Option<OllamaOptions>,
    stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaMessage {
    role: String,
    content: String,
}

#[derive(Debug, Serialize)]
struct OllamaOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    num_predict: Option<u32>,
}

#[derive(Debug, Deserialize)]
struct OllamaResponse {
    message: OllamaMessage,
}

pub async fn send_llm_request(
    config: LLMConfig,
    messages: Vec<LLMMessage>,
) -> Result<LLMResponse, Box<dyn Error>> {
    match config.provider.as_str() {
        "openai" => send_openai_request(config, messages).await,
        "anthropic" => send_anthropic_request(config, messages).await,
        "google" => send_google_request(config, messages).await,
        "ollama" => send_ollama_request(config, messages).await,
        _ => Err(format!("Unsupported provider: {}", config.provider).into()),
    }
}

async fn send_openai_request(
    config: LLMConfig,
    messages: Vec<LLMMessage>,
) -> Result<LLMResponse, Box<dyn Error>> {
    let api_key = config.api_key.ok_or("OpenAI API key is required")?;
    let model = config.model.unwrap_or_else(|| "gpt-4o".to_string());
    let base_url = config.base_url.unwrap_or_else(|| "https://api.openai.com/v1".to_string());

    let client = reqwest::Client::new();
    let request_body = OpenAIRequest {
        model,
        messages: messages
            .into_iter()
            .map(|m| OpenAIMessage {
                role: m.role,
                content: m.content,
            })
            .collect(),
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        stream: Some(false),
    };

    let response = client
        .post(format!("{}/chat/completions", base_url))
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await?;

    let status = response.status();
    let text = response.text().await?;

    if !status.is_success() {
        return Err(format!("OpenAI API error ({}): {}", status, text).into());
    }

    let openai_response: OpenAIResponse = serde_json::from_str(&text)?;

    let content = openai_response
        .choices
        .first()
        .ok_or("No response from OpenAI")?
        .message
        .content
        .clone();

    Ok(LLMResponse {
        content,
        model: openai_response.model,
        usage: openai_response.usage.map(|u| Usage {
            prompt_tokens: u.prompt_tokens,
            completion_tokens: u.completion_tokens,
            total_tokens: u.total_tokens,
        }),
    })
}

async fn send_anthropic_request(
    config: LLMConfig,
    messages: Vec<LLMMessage>,
) -> Result<LLMResponse, Box<dyn Error>> {
    let api_key = config.api_key.ok_or("Anthropic API key is required")?;
    let model = config.model.unwrap_or_else(|| "claude-3-5-sonnet-20241022".to_string());
    let base_url = config.base_url.unwrap_or_else(|| "https://api.anthropic.com/v1".to_string());

    // Filter out system messages and convert to Anthropic format
    let anthropic_messages: Vec<AnthropicMessage> = messages
        .into_iter()
        .filter(|m| m.role != "system")
        .map(|m| AnthropicMessage {
            role: if m.role == "assistant" { "assistant".to_string() } else { "user".to_string() },
            content: m.content,
        })
        .collect();

    let client = reqwest::Client::new();
    let request_body = AnthropicRequest {
        model,
        messages: anthropic_messages,
        temperature: config.temperature,
        max_tokens: config.max_tokens.or(Some(4096)),
    };

    let response = client
        .post(format!("{}/messages", base_url))
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await?;

    let status = response.status();
    let text = response.text().await?;

    if !status.is_success() {
        return Err(format!("Anthropic API error ({}): {}", status, text).into());
    }

    let anthropic_response: AnthropicResponse = serde_json::from_str(&text)?;

    let content = anthropic_response
        .content
        .first()
        .ok_or("No response from Anthropic")?
        .text
        .clone();

    Ok(LLMResponse {
        content,
        model: anthropic_response.model,
        usage: anthropic_response.usage.map(|u| Usage {
            prompt_tokens: u.input_tokens,
            completion_tokens: u.output_tokens,
            total_tokens: u.input_tokens + u.output_tokens,
        }),
    })
}

async fn send_google_request(
    config: LLMConfig,
    messages: Vec<LLMMessage>,
) -> Result<LLMResponse, Box<dyn Error>> {
    let api_key = config.api_key.ok_or("Google API key is required")?;
    let model = config.model.unwrap_or_else(|| "gemini-2.0-flash-exp".to_string());
    let base_url = config.base_url.unwrap_or_else(|| "https://generativelanguage.googleapis.com/v1beta".to_string());

    let google_contents: Vec<GoogleContent> = messages
        .into_iter()
        .filter(|m| m.role != "system")
        .map(|m| GoogleContent {
            role: if m.role == "assistant" { "model".to_string() } else { "user".to_string() },
            parts: vec![GooglePart { text: m.content }],
        })
        .collect();

    let generation_config = if config.temperature.is_some() || config.max_tokens.is_some() {
        Some(GoogleGenerationConfig {
            temperature: config.temperature,
            max_output_tokens: config.max_tokens,
        })
    } else {
        None
    };

    let client = reqwest::Client::new();
    let request_body = GoogleRequest {
        contents: google_contents,
        generation_config,
    };

    let response = client
        .post(format!("{}/models/{}:generateContent?key={}", base_url, model, api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await?;

    let status = response.status();
    let text = response.text().await?;

    if !status.is_success() {
        return Err(format!("Google API error ({}): {}", status, text).into());
    }

    let google_response: GoogleResponse = serde_json::from_str(&text)?;

    let content = google_response
        .candidates
        .first()
        .ok_or("No response from Google")?
        .content
        .parts
        .first()
        .ok_or("No content in Google response")?
        .text
        .clone();

    Ok(LLMResponse {
        content,
        model: Some(model),
        usage: google_response.usage_metadata.map(|u| Usage {
            prompt_tokens: u.prompt_token_count,
            completion_tokens: u.candidates_token_count,
            total_tokens: u.total_token_count,
        }),
    })
}

async fn send_ollama_request(
    config: LLMConfig,
    messages: Vec<LLMMessage>,
) -> Result<LLMResponse, Box<dyn Error>> {
    let model = config.model.unwrap_or_else(|| "llama3.2".to_string());
    let base_url = config.base_url.unwrap_or_else(|| "http://localhost:11434".to_string());

    let ollama_messages: Vec<OllamaMessage> = messages
        .into_iter()
        .map(|m| OllamaMessage {
            role: m.role,
            content: m.content,
        })
        .collect();

    let options = if config.temperature.is_some() || config.max_tokens.is_some() {
        Some(OllamaOptions {
            temperature: config.temperature,
            num_predict: config.max_tokens,
        })
    } else {
        None
    };

    let client = reqwest::Client::new();
    let request_body = OllamaRequest {
        model: model.clone(),
        messages: ollama_messages,
        options,
        stream: false,
    };

    let response = client
        .post(format!("{}/api/chat", base_url))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await?;

    let status = response.status();
    let text = response.text().await?;

    if !status.is_success() {
        return Err(format!("Ollama API error ({}): {}", status, text).into());
    }

    let ollama_response: OllamaResponse = serde_json::from_str(&text)?;

    Ok(LLMResponse {
        content: ollama_response.message.content,
        model: Some(model),
        usage: None,
    })
}
