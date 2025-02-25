use serde::{Serialize, Deserialize};

pub const APP_NAME: &str = "parser-ai";
pub const PARSED_FILES_DIR: &str = "parsed-files";
pub const PRESETS_FILE_NAME: &str = "presets.json";

pub struct Preset {
    pub name: &'static str,
    pub ignore_patterns: &'static [&'static str],
}

pub const PRESETS: &[Preset] = &[
    Preset {
        name: "Test",
        ignore_patterns: &[".git", ".gitignore", "gut", "gap"],
    },
    Preset {
        name: "Git",
        ignore_patterns: &[".git", ".gitignore"],
    },
    Preset {
        name: "JS",
        ignore_patterns: &["Git", "node_modules", "build", ".next"],
    },
    Preset {
        name: "Java",
        ignore_patterns: &["Git", ".maven", "target", "out"],
    },
    Preset {
        name: "Python",
        ignore_patterns: &["Git", "__pycache__", "venv", ".pytest_cache"],
    },
    Preset {
        name: "Rust",
        ignore_patterns: &["Git", "target", "Cargo.lock"],
    },
];

#[derive(Serialize, Deserialize)]
pub struct SavedPreset {
    pub name: String,
    pub ignore_patterns: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct PresetResponse {
    pub default: Vec<SavedPreset>,
    pub saved: Vec<SavedPreset>,
}