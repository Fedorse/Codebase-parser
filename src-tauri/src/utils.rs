use std::fs;
use std::io::{self, Error, ErrorKind};
use std::path::PathBuf;
use directories::ProjectDirs;

const APP_NAME: &str = "parser-ai";

pub fn get_project_dir() -> Result<PathBuf, io::Error> {
    match ProjectDirs::from("", "", APP_NAME) {
        Some(proj_dirs) => {
            let path = proj_dirs.data_local_dir();
            fs::create_dir_all(path)?;
            Ok(path.to_path_buf())
        }
        None => Err(Error::new(ErrorKind::NotFound, "Failed to locate project directory")),
    }
}

pub fn get_file_path(file_name: String) -> Result<PathBuf, String> {
    let project_dir = get_project_dir().map_err(|e| e.to_string())?;
    let file_path = project_dir.join(file_name);

    if file_path.exists() {
        Ok(file_path)
    } else {
        Err("File not found".to_string())
    }
}