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

    // Initial data population
    let status_count: i32 = conn.query_row("SELECT COUNT(*) FROM status", [], |row| row.get(0)).unwrap_or(0);
    if status_count == 0 {
        conn.execute("INSERT INTO status (name, color) VALUES ('LIBERADO', '#10B981')", []).ok();
        conn.execute("INSERT INTO status (name, color) VALUES ('TRANSIÇÃO', '#F59E0B')", []).ok();
        conn.execute("INSERT INTO status (name, color) VALUES ('NO DM', '#EF4444')", []).ok();
    }

    let players_count: i32 = conn.query_row("SELECT COUNT(*) FROM players", [], |row| row.get(0)).unwrap_or(0);
    if players_count == 0 {
        // Players
        conn.execute("INSERT INTO players (name, position) VALUES ('Rafael Lima', 'Meia')", []).ok();
        conn.execute("INSERT INTO players (name, position) VALUES ('Gabriel Souza', 'Atacante')", []).ok();
        conn.execute("INSERT INTO players (name, position) VALUES ('Marcos Santos', 'Zagueiro')", []).ok();

        // Complaints
        conn.execute("INSERT INTO complaints (name) VALUES ('Dor Muscular')", []).ok();
        conn.execute("INSERT INTO complaints (name) VALUES ('Entorse')", []).ok();
        conn.execute("INSERT INTO complaints (name) VALUES ('Fadiga')", []).ok();

        // Shifts (Períodos)
        conn.execute("INSERT INTO shifts (name) VALUES ('Manhã')", []).ok();
        conn.execute("INSERT INTO shifts (name) VALUES ('Tarde')", []).ok();
        conn.execute("INSERT INTO shifts (name) VALUES ('Integral')", []).ok();

        // Treatments
        conn.execute("INSERT INTO treatments (name) VALUES ('Liberação Miofascial')", []).ok();
        conn.execute("INSERT INTO treatments (name) VALUES ('Crioterapia')", []).ok();
        conn.execute("INSERT INTO treatments (name) VALUES ('Alongamento')", []).ok();

        // Records (Daily Report)
        // 1. Rafael Lima (1) - Dor Muscular (1) - Manhã (1) - Liberação (1) - Transição (2)
        conn.execute("INSERT INTO records (player_id, complaint_id, shift_id, treatment_id, status_id, date, observation) 
                      VALUES (1, 1, 1, 1, 2, date('now'), 'Apresentou melhora significativa')", []).ok();
        
        // 2. Gabriel Souza (2) - Entorse (2) - Tarde (2) - Crioterapia (2) - No DM (3)
        conn.execute("INSERT INTO records (player_id, complaint_id, shift_id, treatment_id, status_id, date, observation) 
                      VALUES (2, 2, 2, 2, 3, date('now'), 'Entorse grau II, repouso recomendado')", []).ok();

        // 3. Marcos Santos (3) - Fadiga (3) - Integral (3) - Alongamento (3) - Liberado (1)
        conn.execute("INSERT INTO records (player_id, complaint_id, shift_id, treatment_id, status_id, date, observation) 
                      VALUES (3, 3, 3, 3, 1, date('now'), 'Adicionar observação...')", []).ok();
    }

    Ok(conn)
}

use crate::models::DashboardRecord;

pub fn get_all_records(conn: &Connection) -> Result<Vec<DashboardRecord>, String> {
    let mut stmt = conn.prepare(
        "SELECT 
            r.id, 
            p.name as player_name, 
            p.position, 
            c.name as complaint, 
            s.name as shift, 
            t.name as treatment, 
            st.name as status, 
            st.color as status_color, 
            r.observation
        FROM records r
        JOIN players p ON r.player_id = p.id
        JOIN complaints c ON r.complaint_id = c.id
        JOIN shifts s ON r.shift_id = s.id
        JOIN treatments t ON r.treatment_id = t.id
        JOIN status st ON r.status_id = st.id
        ORDER BY r.id DESC"
    ).map_err(|e| e.to_string())?;

    let rows = stmt.query_map([], |row| {
        Ok(DashboardRecord {
            id: row.get(0)?,
            name: row.get(1)?,
            position: row.get(2)?,
            complaint: row.get(3)?,
            period: row.get(4)?,
            treatment: row.get(5)?,
            status: row.get(6)?,
            status_color: row.get(7)?,
            observation: row.get(8)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut records = Vec::new();
    for row in rows {
        records.push(row.map_err(|e| e.to_string())?);
    }
    Ok(records)
}
