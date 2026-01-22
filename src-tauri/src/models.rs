use serde::{Deserialize, Serialize};

// Model representing a Player in the database.
// #[derive(...)] adds automatic features like JSON conversion (Serialize/Deserialize).
#[derive(Debug, Serialize, Deserialize)]
pub struct Player {
    pub id: i32,
    pub name: String,
    pub position: String,
    pub photo: Option<String>, // Option means it can be null
}

// Raw model of the 'records' table (as saved in SQLite).
#[derive(Debug, Serialize, Deserialize)]
pub struct Record {
    pub id: i32,
    pub player_id: i32,
    pub complaint_id: i32,
    pub shift_id: i32,
    pub treatment_id: i32,
    pub status_id: i32,
    pub date: String,
    pub observation: String,
}

// Generic model for list items (Treatments, Complaints, Status, etc).
#[derive(Debug, Serialize, Deserialize)]
pub struct LookupItem {
    pub id: i32,
    pub name: String,
    pub color: Option<String>, // Only status uses color, others are null
}

// "Enriched" model for the Dashboard.
// Combines data from multiple tables (JOINs) to make it easier for the Frontend to use.
// #[serde(rename_all = "camelCase")] automatically converts snake_case (Rust) to camelCase (JS).
// Ex: status_color (Rust) -> statusColor (JS)
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardRecord {
    pub id: i32,
    pub player_id: i32,
    pub name: String,
    pub position: String,
    pub photo: Option<String>,
    pub complaint_id: i32,
    pub complaint: String,
    pub shift_id: i32,
    pub period: String,
    pub treatment_id: i32,
    pub treatment: String,
    pub status_id: i32,
    pub status: String,
    pub status_color: String,
    pub observation: String,
}

// Structure received from the frontend to UPDATE a record.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateRecordRequest {
    pub id: i32,
    pub player_id: i32,
    pub complaint_id: i32,
    pub shift_id: i32,
    pub treatment_id: i32,
    pub status_id: i32,
    pub observation: String,
}

// Structure that groups all auxiliary lists for dropdowns.
// Sent in a single call to avoid multiple requests.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LookupData {
    pub players: Vec<Player>,
    pub complaints: Vec<LookupItem>,
    pub shifts: Vec<LookupItem>,
    pub treatments: Vec<LookupItem>,
    pub status: Vec<LookupItem>,
}

// Structure received from the frontend to CREATE a new record.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateRecordRequest {
    pub player_id: i32,
    pub complaint_id: i32,
    pub shift_id: i32,
    pub treatment_id: i32,
    pub status_id: i32,
    pub observation: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePlayerRequest {
    pub name: String,
    pub position: String,
    pub photo: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePlayerRequest {
    pub id: i32,
    pub name: String,
    pub position: String,
    pub photo: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateGenericRequest {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateGenericRequest {
    pub id: i32,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportSummary {
    pub date: String,
    pub count: i32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportStats {
    pub reports_this_month: i32,
    pub total_records: i32,
    pub average_per_day: f64,
}
