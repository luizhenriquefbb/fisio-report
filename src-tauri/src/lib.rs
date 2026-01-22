mod db;
mod models;

use db::{init_db, DbState, get_all_records, get_lookup_data, create_record, update_record, delete_record};
use models::{DashboardRecord, LookupData, CreateRecordRequest, UpdateRecordRequest};
use tauri::{AppHandle, Manager, State};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn get_dashboard_data(state: State<'_, DbState>) -> Result<Vec<DashboardRecord>, String> {
    let conn = state.0.lock().unwrap();
    get_all_records(&conn)
}

#[tauri::command]
async fn get_lookup_options(state: State<'_, DbState>) -> Result<LookupData, String> {
    let conn = state.0.lock().unwrap();
    get_lookup_data(&conn)
}

#[tauri::command]
async fn create_new_record(state: State<'_, DbState>, request: CreateRecordRequest) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    create_record(&conn, request)
}

#[tauri::command]
async fn update_existing_record(state: State<'_, DbState>, request: UpdateRecordRequest) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    update_record(&conn, request)
}

#[tauri::command]
async fn delete_record_by_id(state: State<'_, DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    delete_record(&conn, id)
}

#[tauri::command]
async fn delete_player(state: State<'_, DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    
    // Check if player has records
    let count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM records WHERE player_id = ?1",
        [id],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;

    if count > 0 {
        return Err(format!("Não é possível remover este atleta pois existem {} registros históricos vinculados a ele.", count));
    }

    conn.execute("DELETE FROM players WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}

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

#[tauri::command]
async fn generate_report_pdf(app_handle: AppHandle) -> Result<String, String> {
    // This is a placeholder for actual PDF generation logic
    // In a real app, you'd fetch data from DB and use printpdf
    let path = app_handle.path().app_data_dir().unwrap().join("report.pdf");
    Ok(format!("Relatório gerado em: {:?}", path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let conn = init_db(app.handle()).expect("failed to initialize database");
            app.manage(DbState(std::sync::Mutex::new(conn)));
            Ok(())
        })
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
