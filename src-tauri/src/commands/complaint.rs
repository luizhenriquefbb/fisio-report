use tauri::State;
use crate::db::DbState;
use crate::models::{LookupItem, CreateGenericRequest, UpdateGenericRequest};

#[tauri::command]
pub async fn get_all_complaints(state: State<'_, DbState>) -> Result<Vec<LookupItem>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, name FROM complaints ORDER BY name").map_err(|e| e.to_string())?;
    let items = stmt.query_map([], |row| {
        Ok(LookupItem { id: row.get(0)?, name: row.get(1)?, color: None })
    }).map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;
    Ok(items)
}

#[tauri::command]
pub async fn create_complaint(state: State<'_, DbState>, request: CreateGenericRequest) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute("INSERT INTO complaints (name) VALUES (?1)", [request.name]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn update_complaint(state: State<'_, DbState>, request: UpdateGenericRequest) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute("UPDATE complaints SET name = ?1 WHERE id = ?2", (request.name, request.id)).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_complaint(state: State<'_, DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    
    // Check if complaint has records
    let count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM records WHERE complaint_id = ?1",
        [id],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;

    if count > 0 {
        return Err(format!("Não é possível remover esta queixa pois existem {} registros históricos vinculados a ela.", count));
    }

    conn.execute("DELETE FROM complaints WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}
