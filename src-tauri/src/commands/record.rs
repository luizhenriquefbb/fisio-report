use tauri::State;
use crate::db::{DbState, get_all_records, get_lookup_data, create_record, update_record, delete_record};
use crate::models::{DashboardRecord, LookupData, CreateRecordRequest, UpdateRecordRequest};

// Command to get dashboard data.
// Uses the DbState managed by Tauri to access the database.
// "async" allows the operation not to block the UI.
#[tauri::command]
pub async fn get_dashboard_data(state: State<'_, DbState>, date: String) -> Result<Vec<DashboardRecord>, String> {
    // Locks the Mutex to access the connection safely.
    // .unwrap() assumes the lock will work (if it fails, it's a fatal error/panic).
    let conn = state.0.lock().unwrap();
    
    // Calls the function from the database layer (db.rs)
    get_all_records(&conn, date)
}

// Command to get dropdown (select) options.
#[tauri::command]
pub async fn get_lookup_options(state: State<'_, DbState>) -> Result<LookupData, String> {
    let conn = state.0.lock().unwrap();
    get_lookup_data(&conn)
}

// Command to create a new record.
// Receives a "CreateRecordRequest" object sent by the frontend.
#[tauri::command]
pub async fn create_new_record(state: State<'_, DbState>, request: CreateRecordRequest) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    create_record(&conn, request)
}

// Command to update an existing record.
#[tauri::command]
pub async fn update_existing_record(state: State<'_, DbState>, request: UpdateRecordRequest) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    update_record(&conn, request)
}

// Command to delete a specific dashboard record.
#[tauri::command]
pub async fn delete_record_by_id(state: State<'_, DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    delete_record(&conn, id)
}
