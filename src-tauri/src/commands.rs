use std::fs::read_to_string;

use crate::utils::{create_output_file, parse_paths, write_parsed_files, get_app_dir, get_presets_map, write_presets};
use crate::consts::{PRESETS_FILE_NAME, APP_NAME, PARSED_FILES_DIR};

#[tauri::command]
pub fn parse(paths: Vec<String>, ignore_patterns: Vec<String>) -> Result<(), String> {
    let mut output_file = create_output_file().map_err(|e| e.to_string())?;
    let parsed_paths = parse_paths(paths, ignore_patterns).map_err(|e| e.to_string())?;

    write_parsed_files(parsed_paths, &mut output_file)?;
    Ok(())
}

#[tauri::command]
pub fn get_files() -> Result<String, String> {
    let parsed_files_dir = get_app_dir()?.join(PARSED_FILES_DIR);
    let files: String = read_to_string(parsed_files_dir).map_err(|e| e.to_string())?;
    Ok(files)
}

#[tauri::command]
pub fn get_presets() -> Result<String, String> {
    let presets_file = get_app_dir()?.join(PRESETS_FILE_NAME);
    let presets: String = read_to_string(presets_file).map_err(|e| e.to_string())?;

    Ok(presets)
}


#[tauri::command]
pub fn update_preset(name: String, ignore_patterns: Vec<String>) -> Result<(), String> {
    let mut presets = get_presets_map()?;

    presets.insert(name, ignore_patterns);
    write_presets(&presets)?;
    Ok(())
}

#[tauri::command]
pub fn delete_preset(name: String) -> Result<(), String> {
    let mut presets = get_presets_map()?;

    presets.remove(&name);
    write_presets(&presets)?;
    Ok(())
}