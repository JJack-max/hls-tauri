use reqwest::Client;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::State;

// 全局状态存储代理的URL映射
type ProxyMap = Mutex<HashMap<String, String>>;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// 创建代理URL的命令
#[tauri::command]
async fn create_proxy_url(
    original_url: String,
    proxy_map: State<'_, ProxyMap>,
) -> Result<String, String> {
    // 生成一个唯一的代理路径
    let proxy_path = format!("/proxy/{}", uuid::Uuid::new_v4().to_string());

    // 存储原始URL到代理路径的映射
    {
        let mut map = proxy_map.lock().unwrap();
        map.insert(proxy_path.clone(), original_url);
    }

    // 返回代理URL - 使用Tauri的本地服务器
    Ok(format!("http://localhost:1420{}", proxy_path))
}

// 获取代理内容的命令
#[tauri::command]
async fn get_proxy_content(
    proxy_path: String,
    proxy_map: State<'_, ProxyMap>,
) -> Result<Vec<u8>, String> {
    // 从映射中获取原始URL
    let original_url = {
        let map = proxy_map.lock().unwrap();
        map.get(&proxy_path).cloned()
    };

    match original_url {
        Some(url) => {
            // 使用reqwest获取内容
            let client = Client::new();
            match client.get(&url).send().await {
                Ok(response) => match response.bytes().await {
                    Ok(bytes) => Ok(bytes.to_vec()),
                    Err(e) => Err(format!("Failed to read response body: {}", e)),
                },
                Err(e) => Err(format!("Failed to fetch URL: {}", e)),
            }
        }
        None => Err("Proxy path not found".to_string()),
    }
}

// 直接获取视频内容的命令（用于HLS播放）
#[tauri::command]
async fn fetch_video_content(url: String) -> Result<Vec<u8>, String> {
    let client = Client::new();
    match client.get(&url).send().await {
        Ok(response) => match response.bytes().await {
            Ok(bytes) => Ok(bytes.to_vec()),
            Err(e) => Err(format!("Failed to read response body: {}", e)),
        },
        Err(e) => Err(format!("Failed to fetch URL: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .manage(ProxyMap::new(Mutex::new(HashMap::new())))
        .invoke_handler(tauri::generate_handler![
            greet,
            create_proxy_url,
            get_proxy_content,
            fetch_video_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
