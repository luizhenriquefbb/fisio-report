use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Player {
    pub id: i32,
    pub name: String,
    pub position: String,
    pub photo: Option<String>,
}

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

#[derive(Debug, Serialize, Deserialize)]
pub struct LookupItem {
    pub id: i32,
    pub name: String,
    pub color: Option<String>,
}

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

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LookupData {
    pub players: Vec<Player>,
    pub complaints: Vec<LookupItem>,
    pub shifts: Vec<LookupItem>,
    pub treatments: Vec<LookupItem>,
    pub status: Vec<LookupItem>,
}

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
