use tauri::State;
use crate::db::DbState;
use crate::models::{Player, CreatePlayerRequest, UpdatePlayerRequest};

#[tauri::command]
pub async fn get_all_players(state: State<'_, DbState>) -> Result<Vec<Player>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, name, position, photo FROM players ORDER BY name").map_err(|e| e.to_string())?;
    let players = stmt.query_map([], |row| {
        Ok(Player {
            id: row.get(0)?,
            name: row.get(1)?,
            position: row.get(2)?,
            photo: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;
    Ok(players)
}

#[tauri::command]
pub async fn create_player(state: State<'_, DbState>, request: CreatePlayerRequest) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "INSERT INTO players (name, position, photo) VALUES (?1, ?2, ?3)",
        (request.name, request.position, request.photo),
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn update_player(state: State<'_, DbState>, request: UpdatePlayerRequest) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "UPDATE players SET name = ?1, position = ?2, photo = ?3 WHERE id = ?4",
        (request.name, request.position, request.photo, request.id),
    ).map_err(|e| e.to_string())?;
    Ok(())
}

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
