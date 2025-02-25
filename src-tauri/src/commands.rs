use crate::utils::*;
use crate::consts::{PresetResponse, SavedPreset, PARSED_FILES_DIR};

#[tauri::command]
pub fn parse_files(file_paths: Vec<String>, ignore_patterns: Vec<String>) -> Result<String, String> {
    // let _ignore_patterns = ignore_patterns.unwrap_or_else(|| "".to_string());
    let concatenated_content = parse_files_with_patterns(file_paths, ignore_patterns)?;

    let save_path = get_app_dir()
        .map_err(|e| format!("Failed to get app directory: {}", e))?
        .join(PARSED_FILES_DIR)
        .join(get_new_file_name());

    write_parsed_file(&save_path, &concatenated_content)?;

    Ok(save_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn get_files() -> Result<Vec<String>, String> {
    return get_parsed_files();
}

#[tauri::command]
pub fn get_file_content(file_name: String) -> Result<String, String> {
    return read_parsed_file(file_name);
}

#[tauri::command]
pub fn remove_file(file_name: String) -> Result<(), String> {
    return remove_parsed_file(file_name);
}

#[tauri::command]
pub fn update_file(file_name: String, content: String) -> Result<(), String> {
    return update_parsed_file(file_name, content);
}

#[tauri::command]
pub fn get_presets() -> Result<PresetResponse, String> {
    let default_presets = get_default_presets();
    let saved_presets = get_saved_presets().unwrap_or_else(|_| vec![]);

    Ok(PresetResponse {
        default: default_presets,
        saved: saved_presets,
    })
}

#[tauri::command]
pub fn save_preset(preset: SavedPreset) -> Result<(), String> {
    update_saved_preset(preset)
}

#[tauri::command]
pub fn delete_preset(preset: SavedPreset) -> Result<(), String> {
    delete_saved_preset(preset)
}