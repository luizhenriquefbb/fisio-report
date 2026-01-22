use tauri::State;
use crate::db::DbState;

// Similar logic for deleting treatments (history protection).
#[tauri::command]
pub async fn delete_treatment(state: State<'_, DbState>, id: i32) -> Result<(), String> {
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
