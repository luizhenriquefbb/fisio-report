use rusqlite::{Connection, Result};
use std::sync::Mutex;
use tauri::AppHandle;
use std::fs;
use tauri::Manager;

// Structure to keep the database connection safe between threads.
// Mutex (Mutual Exclusion) ensures only one thread accesses the connection at a time.
pub struct DbState(pub Mutex<Connection>);

// Database initialization function.
// Receives the application handle to access system paths.
// Returns a SQLite Connection or an error String.
pub fn init_db(app_handle: &AppHandle) -> Result<Connection, String> {
    // Gets the application data directory (e.g. AppData on Windows, Application Support on Mac)
    // .map_err(|e| e.to_string()) converts the original error to String if it fails.
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    
    // Creates the directory if it doesn't exist
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    
    // Defines the full path of the database file (fisioreport.db)
    let db_path = app_dir.join("fisioreport.db");
    
    // Opens (or creates) the connection to the SQLite database file
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    
    // Table creation if they don't exist.
    // Executes raw SQL commands.
    
    // Players Table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT, -- Auto-incrementing ID
            name TEXT NOT NULL,                   -- Required name
            position TEXT NOT NULL,               -- Required position
            photo TEXT                            -- Optional photo (path or base64)
        )",
        [], // No parameters to substitute in the query
    ).map_err(|e| e.to_string())?;

    // Status Table (e.g. Cleared, Transition)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT                            -- Hex color (e.g. #FF0000)
        )",
        [],
    ).map_err(|e| e.to_string())?;

    // Shifts/Periods Table (Morning, Afternoon)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS shifts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )",
        [],
    ).map_err(|e| e.to_string())?;

    // Treatments Table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS treatments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )",
        [],
    ).map_err(|e| e.to_string())?;

    // Complaints Table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )",
        [],
    ).map_err(|e| e.to_string())?;

    // Main Table for Daily Records
    // Establishing relationships (Foreign Keys) with other tables
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

    // Initial Data Population (Seed)
    // Checks if there are any status registered. If 0, inserts initial data.
    let status_count: i32 = conn.query_row("SELECT COUNT(*) FROM status", [], |row| row.get(0)).unwrap_or(0);
    if status_count == 0 {
        conn.execute("INSERT INTO status (name, color) VALUES ('LIBERADO', '#10B981')", []).ok();
        conn.execute("INSERT INTO status (name, color) VALUES ('TRANSIÇÃO', '#F59E0B')", []).ok();
        conn.execute("INSERT INTO status (name, color) VALUES ('NO DM', '#EF4444')", []).ok();
    }

    // Checks if there are any players. If 0, inserts initial mock data for testing.
    let players_count: i32 = conn.query_row("SELECT COUNT(*) FROM players", [], |row| row.get(0)).unwrap_or(0);
    if players_count == 0 {
        // Inserting Players
        conn.execute("INSERT INTO players (name, position) VALUES ('Rafael Lima', 'Meia')", []).ok();
        conn.execute("INSERT INTO players (name, position) VALUES ('Gabriel Souza', 'Atacante')", []).ok();
        conn.execute("INSERT INTO players (name, position) VALUES ('Marcos Santos', 'Zagueiro')", []).ok();

        // Inserting Complaints
        conn.execute("INSERT INTO complaints (name) VALUES ('Dor Muscular')", []).ok();
        conn.execute("INSERT INTO complaints (name) VALUES ('Entorse')", []).ok();
        conn.execute("INSERT INTO complaints (name) VALUES ('Fadiga')", []).ok();

        // Inserting Periods
        conn.execute("INSERT INTO shifts (name) VALUES ('Manhã')", []).ok();
        conn.execute("INSERT INTO shifts (name) VALUES ('Tarde')", []).ok();
        conn.execute("INSERT INTO shifts (name) VALUES ('Integral')", []).ok();

        // Inserting Treatments
        conn.execute("INSERT INTO treatments (name) VALUES ('Liberação Miofascial')", []).ok();
        conn.execute("INSERT INTO treatments (name) VALUES ('Crioterapia')", []).ok();
        conn.execute("INSERT INTO treatments (name) VALUES ('Alongamento')", []).ok();

        // Inserting Example Records
        conn.execute("INSERT INTO records (player_id, complaint_id, shift_id, treatment_id, status_id, date, observation) 
                      VALUES (1, 1, 1, 1, 2, date('now'), 'Apresentou melhora significativa')", []).ok();
        
        conn.execute("INSERT INTO records (player_id, complaint_id, shift_id, treatment_id, status_id, date, observation) 
                      VALUES (2, 2, 2, 2, 3, date('now'), 'Entorse grau II, repouso recomendado')", []).ok();

        conn.execute("INSERT INTO records (player_id, complaint_id, shift_id, treatment_id, status_id, date, observation) 
                      VALUES (3, 3, 3, 3, 1, date('now'), 'Adicionar observação...')", []).ok();
    }

    Ok(conn)
}

use crate::models::{DashboardRecord, LookupData, Player, LookupItem, CreateRecordRequest, UpdateRecordRequest, ReportSummary, ReportStats};

pub fn get_report_summaries(conn: &Connection, date_filter: Option<String>) -> Result<Vec<ReportSummary>, String> {
    let mut query = "SELECT date, COUNT(*) as count FROM records ".to_string();
    
    if let Some(date) = date_filter {
        if !date.is_empty() {
            query.push_str(&format!("WHERE date = '{}' ", date));
        }
    }
    
    query.push_str("GROUP BY date ORDER BY date DESC");

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| {
        Ok(ReportSummary {
            date: row.get(0)?,
            count: row.get(1)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut summaries = Vec::new();
    for row in rows {
        summaries.push(row.map_err(|e| e.to_string())?);
    }
    Ok(summaries)
}

pub fn get_report_stats(conn: &Connection) -> Result<ReportStats, String> {
    // Total records
    let total_records: i32 = conn.query_row("SELECT COUNT(*) FROM records", [], |row| row.get(0)).unwrap_or(0);
    
    // Reports this month (distinct days with records in current month)
    let reports_this_month: i32 = conn.query_row(
        "SELECT COUNT(DISTINCT date) FROM records WHERE strftime('%m', date) = strftime('%m', 'now') AND strftime('%Y', date) = strftime('%Y', 'now')",
        [],
        |row| row.get(0)
    ).unwrap_or(0);

    // Average per day
    let distinct_days: i32 = conn.query_row("SELECT COUNT(DISTINCT date) FROM records", [], |row| row.get(0)).unwrap_or(1);
    let average = if distinct_days > 0 {
        total_records as f64 / distinct_days as f64
    } else {
        0.0
    };

    Ok(ReportStats {
        reports_this_month,
        total_records,
        average_per_day: (average * 10.0).round() / 10.0, // 1 decimal place
    })
}

// Function to fetch all dashboard records for a specific date.
// Performs multiple JOINs to fetch names (e.g. player name) instead of just IDs.
pub fn get_all_records(conn: &Connection, date: String) -> Result<Vec<DashboardRecord>, String> {
    let mut stmt = conn.prepare(
        "SELECT 
            r.id, 
            r.player_id,
            p.name as player_name, 
            p.position, 
            p.photo,
            r.complaint_id,
            c.name as complaint, 
            r.shift_id,
            s.name as shift, 
            r.treatment_id,
            t.name as treatment, 
            r.status_id,
            st.name as status, 
            st.color as status_color, 
            r.observation
        FROM records r
        JOIN players p ON r.player_id = p.id
        JOIN complaints c ON r.complaint_id = c.id
        JOIN shifts s ON r.shift_id = s.id
        JOIN treatments t ON r.treatment_id = t.id
        JOIN status st ON r.status_id = st.id
        WHERE r.date = ?1
        ORDER BY r.id DESC"
    ).map_err(|e| e.to_string())?;

    // Maps each SQL result row to the DashboardRecord struct
    let rows = stmt.query_map([date], |row| {
        Ok(DashboardRecord {
            id: row.get(0)?,
            player_id: row.get(1)?,
            name: row.get(2)?,
            position: row.get(3)?,
            photo: row.get(4)?,
            complaint_id: row.get(5)?,
            complaint: row.get(6)?,
            shift_id: row.get(7)?,
            period: row.get(8)?,
            treatment_id: row.get(9)?,
            treatment: row.get(10)?,
            status_id: row.get(11)?,
            status: row.get(12)?,
            status_color: row.get(13)?,
            observation: row.get(14)?,
        })
    }).map_err(|e| e.to_string())?;

    // Collects all results into a Vector (Vec)
    let mut records = Vec::new();
    for row in rows {
        records.push(row.map_err(|e| e.to_string())?);
    }
    Ok(records)
}

// Function to update an existing record
pub fn update_record(conn: &Connection, request: UpdateRecordRequest) -> Result<(), String> {
    // ?1, ?2... are placeholders that will be replaced by the values in the tuple below
    conn.execute(
        "UPDATE records SET 
            player_id = ?1, 
            complaint_id = ?2, 
            shift_id = ?3, 
            treatment_id = ?4, 
            status_id = ?5, 
            observation = ?6
         WHERE id = ?7",
        (request.player_id, request.complaint_id, request.shift_id, request.treatment_id, request.status_id, request.observation, request.id),
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// Function to delete a record by ID
pub fn delete_record(conn: &Connection, id: i32) -> Result<(), String> {
    conn.execute("DELETE FROM records WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}

// Helper function to load all dropdown options at once.
// Optimizes performance by avoiding multiple frontend calls.
pub fn get_lookup_data(conn: &Connection) -> Result<LookupData, String> {
    // Fetch Players
    let mut players_stmt = conn.prepare("SELECT id, name, position, photo FROM players ORDER BY name").map_err(|e| e.to_string())?;
    let players = players_stmt.query_map([], |row| {
        Ok(Player {
            id: row.get(0)?,
            name: row.get(1)?,
            position: row.get(2)?,
            photo: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;

    // Fetch Complaints
    let mut complaints_stmt = conn.prepare("SELECT id, name FROM complaints ORDER BY name").map_err(|e| e.to_string())?;
    let complaints = complaints_stmt.query_map([], |row| {
        Ok(LookupItem { id: row.get(0)?, name: row.get(1)?, color: None })
    }).map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;

    // Fetch Shifts
    let mut shifts_stmt = conn.prepare("SELECT id, name FROM shifts").map_err(|e| e.to_string())?;
    let shifts = shifts_stmt.query_map([], |row| {
        Ok(LookupItem { id: row.get(0)?, name: row.get(1)?, color: None })
    }).map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;

    // Fetch Treatments
    let mut treatments_stmt = conn.prepare("SELECT id, name FROM treatments ORDER BY name").map_err(|e| e.to_string())?;
    let treatments = treatments_stmt.query_map([], |row| {
        Ok(LookupItem { id: row.get(0)?, name: row.get(1)?, color: None })
    }).map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;

    // Fetch Status (including color)
    let mut status_stmt = conn.prepare("SELECT id, name, color FROM status").map_err(|e| e.to_string())?;
    let status = status_stmt.query_map([], |row| {
        Ok(LookupItem { id: row.get(0)?, name: row.get(1)?, color: row.get(2)? })
    }).map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;

    Ok(LookupData {
        players,
        complaints,
        shifts,
        treatments,
        status,
    })
}

// Function to create a new record in the database
pub fn create_record(conn: &Connection, request: CreateRecordRequest) -> Result<(), String> {
    conn.execute(
        "INSERT INTO records (player_id, complaint_id, shift_id, treatment_id, status_id, date, observation) 
         VALUES (?1, ?2, ?3, ?4, ?5, date('now'), ?6)",
        (request.player_id, request.complaint_id, request.shift_id, request.treatment_id, request.status_id, request.observation),
    ).map_err(|e| e.to_string())?;
    Ok(())
}
