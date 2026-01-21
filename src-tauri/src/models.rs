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
