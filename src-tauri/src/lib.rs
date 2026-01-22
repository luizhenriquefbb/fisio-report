mod db;
mod models;

use db::{init_db, DbState, get_all_records, get_lookup_data, create_record, update_record, delete_record};
use models::{DashboardRecord, LookupData, CreateRecordRequest, UpdateRecordRequest};
use tauri::{AppHandle, Manager, State};

// The "greet" command is a simple example that takes a name and returns a greeting.
// #[tauri::command] marks this function to be callable by the frontend (React).
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Command to get dashboard data.
// Uses the DbState managed by Tauri to access the database.
// "async" allows the operation not to block the UI.
#[tauri::command]
async fn get_dashboard_data(state: State<'_, DbState>) -> Result<Vec<DashboardRecord>, String> {
    // Locks the Mutex to access the connection safely.
    // .unwrap() assumes the lock will work (if it fails, it's a fatal error/panic).
    let conn = state.0.lock().unwrap();
    
    // Calls the function from the database layer (db.rs)
    get_all_records(&conn)
}

// Command to get dropdown (select) options.
#[tauri::command]
async fn get_lookup_options(state: State<'_, DbState>) -> Result<LookupData, String> {
    let conn = state.0.lock().unwrap();
    get_lookup_data(&conn)
}

// Command to create a new record.
// Receives a "CreateRecordRequest" object sent by the frontend.
#[tauri::command]
async fn create_new_record(state: State<'_, DbState>, request: CreateRecordRequest) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    create_record(&conn, request)
}

// Command to update an existing record.
#[tauri::command]
async fn update_existing_record(state: State<'_, DbState>, request: UpdateRecordRequest) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    update_record(&conn, request)
}

// Command to delete a specific dashboard record.
#[tauri::command]
async fn delete_record_by_id(state: State<'_, DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    delete_record(&conn, id)
}

// Command to delete a player.
// Implements BUSINESS RULE: Block deletion if there is historical data.
#[tauri::command]
async fn delete_player(state: State<'_, DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    
    // 1. Checks if there are records in the 'records' table linked to this player.
    let count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM records WHERE player_id = ?1",
        [id],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;

    // 2. If there are records (count > 0), returns an ERROR to the frontend.
    // This prevents deletion and preserves historical integrity.
    if count > 0 {
        return Err(format!("Não é possível remover este atleta pois existem {} registros históricos vinculados a ele.", count));
    }

    // 3. If there is no history, proceeds with deletion.
    conn.execute("DELETE FROM players WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}

// Similar logic for deleting treatments (history protection).
#[tauri::command]
async fn delete_treatment(state: State<'_, DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    
    // Check if treatment has records
    let count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM records WHERE treatment_id = ?1",
        [id],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;

    if count > 0 {
        return Err(format!("Não é possível remover este tratamento pois existem {} registros históricos vinculados a ele.", count));
    }

    conn.execute("DELETE FROM treatments WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}

// Placeholder for PDF generation.
#[tauri::command]
async fn generate_report_pdf(app_handle: AppHandle) -> Result<String, String> {
    // This is a placeholder for actual PDF generation logic
    // In a real app, you'd fetch data from DB and use printpdf
    let path = app_handle.path().app_data_dir().unwrap().join("report.pdf");
    Ok(format!("Relatório gerado em: {:?}", path))
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
            delete_player, 
            delete_treatment,
            generate_report_pdf,
            get_dashboard_data,
            get_lookup_options,
            create_new_record,
            update_existing_record,
            delete_record_by_id
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
