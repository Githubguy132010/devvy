mod llm;

use llm::{send_llm_request, LLMConfig, LLMMessage, LLMResponse};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn send_llm_message(
    config: LLMConfig,
    messages: Vec<LLMMessage>,
) -> Result<LLMResponse, String> {
    send_llm_request(config, messages)
        .await
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, send_llm_message])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
