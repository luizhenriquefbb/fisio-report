use tauri::State;
use crate::db::DbState;

// Command to delete a player.
// Implements BUSINESS RULE: Block deletion if there is historical data.
#[tauri::command]
pub async fn delete_player(state: State<'_, DbState>, id: i32) -> Result<(), String> {
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
