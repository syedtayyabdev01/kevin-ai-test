use keyring::Entry;
use reqwest::{header, Client, Url};
use serde::Serialize;
use std::time::Duration;

const SERVICE: &str = "com.kevintrader.kevinaitest";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ProviderStatus {
    id: &'static str,
    name: &'static str,
    configured: bool,
}

fn provider_name(id: &str) -> Option<&'static str> {
    match id {
        "openai" => Some("OpenAI"),
        "gemini" => Some("Google Gemini"),
        "groq" => Some("Groq"),
        "anthropic" => Some("Anthropic Claude"),
        "openrouter" => Some("OpenRouter"),
        "ollama" => Some("Ollama"),
        "custom" => Some("Custom OpenAI-compatible"),
        _ => None,
    }
}

fn credential_entry(provider_id: &str) -> Result<Entry, String> {
    Entry::new(SERVICE, provider_id).map_err(|_| "The operating-system credential vault is unavailable.".to_string())
}

#[tauri::command]
async fn list_provider_status() -> Result<Vec<ProviderStatus>, String> {
    let providers = [
        ("openai", "OpenAI"),
        ("gemini", "Google Gemini"),
        ("groq", "Groq"),
        ("anthropic", "Anthropic Claude"),
        ("openrouter", "OpenRouter"),
        ("ollama", "Ollama"),
        ("custom", "Custom OpenAI-compatible"),
    ];
    providers.into_iter().map(|(id, name)| {
        let configured = credential_entry(id).and_then(|entry| {
            entry.get_password().map(|_| ()).map_err(|_| "not configured".to_string())
        }).is_ok();
        Ok(ProviderStatus { id, name, configured })
    }).collect()
}

fn endpoint_for(provider_id: &str, base_url: &str) -> Result<(String, bool), String> {
    let default = match provider_id {
        "openai" => "https://api.openai.com/v1",
        "groq" => "https://api.groq.com/openai/v1",
        "openrouter" => "https://openrouter.ai/api/v1",
        "anthropic" => "https://api.anthropic.com/v1",
        "gemini" => "https://generativelanguage.googleapis.com/v1beta",
        "ollama" => "http://localhost:11434/api",
        "custom" => "",
        _ => return Err("Unsupported provider.".into()),
    };
    let root = if base_url.trim().is_empty() { default } else { base_url.trim() };
    let parsed = Url::parse(root).map_err(|_| "Enter a valid provider base URL.".to_string())?;
    let local_http = parsed.scheme() == "http" && (parsed.host_str() == Some("localhost") || parsed.host_str() == Some("127.0.0.1"));
    if parsed.scheme() != "https" && !local_http {
        return Err("Use HTTPS for remote providers. HTTP is allowed only for localhost.".into());
    }
    if provider_id == "custom" && base_url.trim().is_empty() {
        return Err("A base URL is required for a custom provider.".into());
    }
    let path = match provider_id {
        "anthropic" => "/models",
        "gemini" => "/models",
        "ollama" => "/tags",
        _ => "/models",
    };
    Ok((format!("{}{}", root.trim_end_matches('/'), path), provider_id == "gemini"))
}

#[tauri::command]
async fn test_and_save_provider(provider_id: String, api_key: String, base_url: Option<String>) -> Result<String, String> {
    if provider_name(&provider_id).is_none() {
        return Err("Choose a supported provider.".into());
    }
    if api_key.trim().is_empty() && provider_id != "ollama" {
        return Err("Enter an API key before testing the connection.".into());
    }
    let (endpoint, is_gemini) = endpoint_for(&provider_id, base_url.as_deref().unwrap_or(""))?;
    let client = Client::builder().timeout(Duration::from_secs(15)).build()
        .map_err(|_| "Could not initialize the secure network client.".to_string())?;
    let mut request = client.get(endpoint);
    if is_gemini {
        request = request.header("x-goog-api-key", api_key.trim());
    } else if provider_id == "anthropic" {
        request = request.header("x-api-key", api_key.trim()).header("anthropic-version", "2023-06-01");
    } else if !api_key.trim().is_empty() {
        request = request.header(header::AUTHORIZATION, format!("Bearer {}", api_key.trim()));
    }
    let response = request.send().await.map_err(|_| "Connection failed. Check the URL, network, and provider availability.".to_string())?;
    let status = response.status();
    if !status.is_success() {
        return Err(match status.as_u16() {
            401 | 403 => "The provider rejected this API key or its permissions.".to_string(),
            404 => "The provider endpoint was not found. Check the base URL.".to_string(),
            429 => "The provider rate limit was reached. Try again later.".to_string(),
            _ => format!("Provider connection failed (HTTP {}).", status.as_u16()),
        });
    }
    let entry = credential_entry(&provider_id)?;
    if api_key.trim().is_empty() {
        return Ok(format!("{} connection verified. No API key was required.", provider_name(&provider_id).unwrap()));
    }
    entry.set_password(api_key.trim()).map_err(|_| "Connection passed, but the operating-system credential vault could not save the key.".to_string())?;
    Ok(format!("{} connected. API key saved in the operating-system credential vault.", provider_name(&provider_id).unwrap()))
}

#[tauri::command]
fn remove_provider_key(provider_id: String) -> Result<(), String> {
    if provider_name(&provider_id).is_none() {
        return Err("Unsupported provider.".into());
    }
    let entry = credential_entry(&provider_id)?;
    match entry.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(_) => Err("Could not remove the credential from the operating-system vault.".into()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![list_provider_status, test_and_save_provider, remove_provider_key])
        .run(tauri::generate_context!())
        .expect("error while running KEVIN AI TEST");
}
