// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod utils;
pub mod commands;
pub mod error;

use tauri_plugin_log;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{TrayIconBuilder};
use tauri::{Emitter, Manager};


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(e) = utils::init_app_structure() {
        eprintln!("Error setting up app structure: {}", e);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .setup(|app| {
            // 1. Define Menu Items
            let open_local = MenuItem::with_id(app, "open_local", "Open local project", true, None::<&str>)?;
            let open_github = MenuItem::with_id(app, "open_github", "Open Github Project", true, None::<&str>)?;
            let show_parsed = MenuItem::with_id(app, "show_parsed", "Show parsed projects", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;

            // 2. Build the Menu
            let menu = Menu::with_items(app, &[
                &open_local,
                &open_github,
                &separator,
                &show_parsed
            ])?;

            // 3. Create the Tray
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| {
                    // When a menu item is clicked:

                    // A. Bring the window to front and focus it
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }

                    // B. Send event to Svelte with the ID (e.g., "open_local")
                    let _ = app.emit("tray-event", event.id.as_ref());
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_preview_tree,
            commands::get_parsed_preview_tree,
            commands::parse,
            commands::parse_repository,
            commands::get_files,
            commands::get_file_content,
            commands::get_file_metadata,
            commands::update_file,
            commands::rename_file,
            commands::delete_file,
            commands::open_in_default_editor,
            commands::open_in_folder,
            commands::expand_folder,
            commands::expand_parsed_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
