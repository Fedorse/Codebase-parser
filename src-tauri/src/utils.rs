use crate::consts::{
    APP_NAME, PARSED_FILES_DIR, PREVIEW_LINE_LIMIT,
};
use anyhow;
use chrono::Local;
use dirs;
use serde::Serialize;
use std::{
    fs::{self, File},
    io::Write,
    path::{Path, PathBuf},
    process::Command,
};

#[derive(Serialize)]
pub struct FilePreview {
    path: String,
    name: String,
    preview: String,
    size: u64,
}


#[derive(Debug, Serialize)]
#[serde(tag = "type")]
pub enum ParsedPath {
    File {
        name: String,
        path: String,
    },
    Directory {
        name: String,
        path: String,
        children: Vec<ParsedPath>,
    }
}

pub fn init_app_structure() -> anyhow::Result<()> {
    let app_dir = get_app_dir()?;

    if app_dir.exists() {
        return Ok(());
    }

    fs::create_dir(&app_dir)?;
    fs::create_dir(&app_dir.join(PARSED_FILES_DIR))?;

    Ok(())
}

pub fn create_output_file() -> anyhow::Result<File> {
    let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();
    let file_name = format!("{}.txt", timestamp);
    let file_path = get_app_dir()?.join(PARSED_FILES_DIR).join(file_name);
    let file = fs::File::create(file_path)?;
    Ok(file)
}

pub fn write_parsed_files(paths: Vec<String>, output_file: &mut File) -> anyhow::Result<()> {
    let combined_content = paths
        .into_iter()
        .filter_map(|path| {
            fs::read_to_string(&path)
                .map(|content| format!("===== {} =====\n{}", path, content))
                .ok()
        })
        .collect::<Vec<_>>()
        .join("\n");

    writeln!(output_file, "{}", combined_content)?;

    Ok(())
}

pub fn get_file_preview(file_path: PathBuf) -> anyhow::Result<FilePreview> {
    let meta = fs::metadata(&file_path)?;
    let bytes = fs::read(&file_path)?;

    let preview = String::from_utf8_lossy(&bytes)
        .lines()
        .take(PREVIEW_LINE_LIMIT)
        .collect::<Vec<_>>()
        .join("\n");

    let name = file_path
        .file_name()
        .ok_or(anyhow::anyhow!("Failed to extract filename"))?
        .to_string_lossy()
        .to_string();

    Ok(FilePreview {
        name,
        preview,
        path: file_path.to_string_lossy().to_string(),
        size: meta.len(),
    })
}

pub fn build_file_tree(path: &Path) -> anyhow::Result<ParsedPath> {
    let name = path.file_name().ok_or(anyhow::anyhow!("Failed to extract filename"))?.to_string_lossy().to_string();
    let file_path = path.to_string_lossy().to_string();

    if path.is_dir() {
        let mut children = Vec::new();

        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                children.push(build_file_tree(&entry.path())?);
            }
        }
        Ok(ParsedPath::Directory { name, children, path: file_path })
    } else {
        Ok(ParsedPath::File {
            name,
            path: file_path,
        })
    }
}

pub fn get_app_dir() -> anyhow::Result<PathBuf> {
    let home_dir = dirs::home_dir()
        .ok_or(anyhow::anyhow!("Can't access home dir"))?
        .join(APP_NAME);
    Ok(home_dir)
}

pub fn open_with_default_app(path: &Path) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", &path.to_string_lossy()])
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    Ok(())
}

