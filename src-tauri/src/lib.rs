mod db;
mod models;
mod commands;

use db::{init_db, DbState};
use tauri::Manager;

// The "greet" command is a simple example that takes a name and returns a greeting.
// #[tauri::command] marks this function to be callable by the frontend (React).
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Application entry point.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Initialize required plugins
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_dialog::init()) // Required for native alerts and confirmations
        
        // Initial setup: Connects to the database and stores the state in application memory.
        .setup(|app| {
            let conn = init_db(app.handle()).expect("failed to initialize database");
            app.manage(DbState(std::sync::Mutex::new(conn)));
            Ok(())
        })
        // Registers all commands that can be called from JavaScript.
        .invoke_handler(tauri::generate_handler![
            greet, 
            
            // Player Commands
            commands::player::get_all_players,
            commands::player::create_player,
            commands::player::update_player,
            commands::player::delete_player, 

            // Treatment Commands
            commands::treatment::get_all_treatments,
            commands::treatment::create_treatment,
            commands::treatment::update_treatment,
            commands::treatment::delete_treatment, 

            // Complaint Commands
            commands::complaint::get_all_complaints,
            commands::complaint::create_complaint,
            commands::complaint::update_complaint,
            commands::complaint::delete_complaint, 

            // Shift Commands
            commands::shift::get_all_shifts,
            commands::shift::create_shift,
            commands::shift::update_shift,
            commands::shift::delete_shift, 

            // Record & Report Commands
            commands::report::generate_report_pdf, 
            commands::record::get_dashboard_data, 
            commands::record::get_lookup_options, 
            commands::record::create_new_record, 
            commands::record::update_existing_record, 
            commands::record::delete_record_by_id
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
