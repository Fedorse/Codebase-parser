use crate::error::CommandError;
use crate::utils::{self, ParseMetadata, ParsedPath, PARSED_FILES_DIR};
use anyhow::Result;
use chrono::{DateTime, Local};
use std::fs;
use std::path::PathBuf;
use tokio::fs as tokio_fs;
use futures::future::join_all;

// ... (parse, get_preview_tree remain same) ...
#[tauri::command]
pub async fn parse(paths: Vec<String>, app: tauri::AppHandle) -> Result<ParseMetadata, CommandError> {
    let metadata = utils::parse_files_async(paths, app).await?;
    Ok(metadata)
}

#[tauri::command]
pub async fn get_preview_tree(paths: Vec<String>) -> Result<Vec<ParsedPath>, CommandError> {
    let mut result = Vec::new();
    for input in paths {
        let path = PathBuf::from(input);
        if path.exists() { result.push(utils::build_file_tree(&path)?); }
    }
    Ok(result)
}

// ============================================================================
// FILE LISTING
// ============================================================================

/// Lightweight list item for displaying parsed files
#[derive(serde::Serialize)]
pub struct ParsedFileListItem {
    pub id: String,
    pub name: String,
    pub directory_path: String,
    pub file_size: u64,
    pub files_count: usize,
    pub total_size: u64,
    pub created_at: DateTime<Local>,
    pub last_modified: DateTime<Local>, // This will now reflect updated_at
}

#[tauri::command]
pub async fn get_files(limit: Option<usize>) -> Result<Vec<ParsedFileListItem>, CommandError> {
    let parsed_files_dir = utils::get_app_dir()?.join(PARSED_FILES_DIR);
    if !parsed_files_dir.exists() { return Ok(Vec::new()); }

    // 1. Read directory entries (Async)
    let mut entries = tokio_fs::read_dir(&parsed_files_dir).await
        .map_err(|e| CommandError::from(anyhow::anyhow!(e)))?;

    let mut dir_entries = Vec::new();

    while let Some(entry) = entries.next_entry().await
        .map_err(|e| CommandError::from(anyhow::anyhow!(e)))?
    {
        let path = entry.path();
        if path.is_dir() {
            // We use the FS timestamp just for initial sorting before reading the JSON
            if let Ok(metadata) = entry.metadata().await {
                if let Ok(modified) = metadata.modified() {
                    let modified: DateTime<Local> = modified.into();
                    dir_entries.push((path, modified));
                }
            }
        }
    }

    // 2. Sort by Directory Modification Time (Newest first)
    // This is a rough sort. Ideally, we would sort by the JSON updated_at,
    // but we haven't loaded the JSON yet. This is usually close enough.
    dir_entries.sort_by(|a, b| b.1.cmp(&a.1));

    // 3. Apply limit
    if let Some(limit) = limit {
        dir_entries.truncate(limit);
    }

    // 4. Parallel Load
    let tasks: Vec<_> = dir_entries.into_iter().map(|(path, _)| {
        tokio::spawn(async move {
            load_list_item(path).await
        })
    }).collect();

    // 5. Gather results
    let results = join_all(tasks).await;

    let mut files_list = Vec::new();
    for res in results {
        if let Ok(Ok(item)) = res {
            files_list.push(item);
        }
    }

    // Optional: Re-sort based on exact JSON updated_at if strict order is needed
    // files_list.sort_by(|a, b| b.last_modified.cmp(&a.last_modified));

    Ok(files_list)
}

/// Helper to load a single list item efficiently
async fn load_list_item(path: PathBuf) -> Result<ParsedFileListItem, anyhow::Error> {
    let metadata_path = path.join(utils::METADATA_FILENAME);
    let content_path = path.join(utils::CONTENT_FILENAME);

    // Get content.txt size (Async)
    let file_size = match tokio_fs::metadata(&content_path).await {
        Ok(m) => m.len(),
        Err(_) => 0,
    };

    // Read metadata.json
    let content = tokio_fs::read_to_string(&metadata_path).await?;
    let metadata: ParseMetadata = serde_json::from_str(&content)?;

    Ok(ParsedFileListItem {
        id: metadata.id,
        name: metadata.name,
        directory_path: path.to_string_lossy().to_string(),
        file_size,
        files_count: metadata.files_count,
        total_size: metadata.total_size,
        created_at: metadata.created_at,
        // Map updated_at to last_modified for the frontend
        last_modified: metadata.updated_at,
    })
}

// ... (Rest of commands.rs matches what you had, just ensure update_file is linked) ...
// ... get_file_detail, get_file_content, get_file_metadata ...

#[derive(serde::Serialize)]
pub struct ParsedFileDetail {
    pub id: String,
    pub name: String,
    pub content: String,
    pub metadata: utils::CompleteParseDetail,
}

// #[tauri::command]
// pub async fn get_file_detail(dir_name: String) -> Result<ParsedFileDetail, CommandError> {
//     let parse_dir = utils::get_parse_dir(&dir_name)?;
//     let content = utils::load_content(&parse_dir)?;
//     let metadata_light = utils::load_metadata(&parse_dir)?;
//     let tree_data = utils::load_tree(&parse_dir)?;

//     let complete_metadata = utils::CompleteParseDetail {
//         metadata: metadata_light.clone(),
//         tree: tree_data,
//     };

//     Ok(ParsedFileDetail {
//         id: dir_name,
//         name: metadata_light.name,
//         content,
//         metadata: complete_metadata,
//     })
// }

#[tauri::command]
pub fn update_file(dir_name: String, content: String) -> Result<(), CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    // This now updates content AND metadata timestamp
    utils::update_content(&parse_dir, &content)?;
    Ok(())
}

// ... (Rest: rename_file, delete_file, open_in_default_editor, etc) ...
#[tauri::command]
pub fn get_file_content(dir_name: String) -> Result<String, CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    Ok(utils::load_content(&parse_dir)?)
}

#[tauri::command]
pub fn get_file_metadata(dir_name: String) -> Result<ParseMetadata, CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    Ok(utils::load_metadata(&parse_dir)?)
}

#[tauri::command]
pub fn get_file_tree(dir_name: String) -> Result<Vec<ParsedPath>, CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    Ok(utils::load_tree(&parse_dir)?)
}

#[tauri::command]
pub fn rename_file(dir_name: String, new_name: String) -> Result<(), CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    let mut metadata = utils::load_metadata(&parse_dir)?;
    metadata.name = new_name;
    utils::save_metadata(&utils::get_metadata_path(&parse_dir), &metadata)?;
    Ok(())
}
#[tauri::command]
pub fn delete_file(dir_name: String) -> Result<(), CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    fs::remove_dir_all(parse_dir)?;
    Ok(())
}
#[tauri::command]
pub fn open_in_default_editor(dir_name: String) -> Result<(), CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    utils::open_with_default_app(utils::OpenAction::OpenFile(utils::get_content_path(&parse_dir)))?;
    Ok(())
}
#[tauri::command]
pub fn open_in_folder(dir_name: String) -> Result<(), CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    utils::open_with_default_app(utils::OpenAction::RevealInFolder(parse_dir))?;
    Ok(())
}