use rusqlite::{Connection, Result};
use std::sync::Mutex;
use tauri::AppHandle;
use std::fs;
use tauri::Manager;

pub struct DbState(pub Mutex<Connection>);

pub fn init_db(app_handle: &AppHandle) -> Result<Connection, String> {
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    let db_path = app_dir.join("fisioreport.db");
    
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            position TEXT NOT NULL,
            photo TEXT
        )",
        [],
    ).map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT
        )",
        [],
    ).map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS shifts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )",
        [],
    ).map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS treatments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )",
        [],
    ).map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )",
        [],
    ).map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            complaint_id INTEGER NOT NULL,
            shift_id INTEGER NOT NULL,
            treatment_id INTEGER NOT NULL,
            status_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            observation TEXT,
            FOREIGN KEY(player_id) REFERENCES players(id),
            FOREIGN KEY(complaint_id) REFERENCES complaints(id),
            FOREIGN KEY(shift_id) REFERENCES shifts(id),
            FOREIGN KEY(treatment_id) REFERENCES treatments(id),
            FOREIGN KEY(status_id) REFERENCES status(id)
        )",
        [],
    ).map_err(|e| e.to_string())?;

    // Initial data if empty
    let count: i32 = conn.query_row("SELECT COUNT(*) FROM status", [], |row| row.get(0)).unwrap_or(0);
    if count == 0 {
        conn.execute("INSERT INTO status (name, color) VALUES ('LIBERADO', '#10B981')", []).ok();
        conn.execute("INSERT INTO status (name, color) VALUES ('TRANSIÇÃO', '#F59E0B')", []).ok();
        conn.execute("INSERT INTO status (name, color) VALUES ('NO DM', '#EF4444')", []).ok();
    }

    Ok(conn)
}
