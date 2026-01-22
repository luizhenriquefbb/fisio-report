use tauri::{AppHandle, Manager, State};
use crate::db::{DbState, get_report_summaries, get_report_stats};
use crate::models::{ReportSummary, ReportStats};

// Command to get summaries of reports grouped by date.
#[tauri::command]
pub async fn get_reports(state: State<'_, DbState>, date_filter: Option<String>) -> Result<Vec<ReportSummary>, String> {
    let conn = state.0.lock().unwrap();
    get_report_summaries(&conn, date_filter)
}

// Command to get report statistics.
#[tauri::command]
pub async fn get_report_statistics(state: State<'_, DbState>) -> Result<ReportStats, String> {
    let conn = state.0.lock().unwrap();
    get_report_stats(&conn)
}

// Placeholder for PDF generation.
#[tauri::command]
pub async fn generate_report_pdf(app_handle: AppHandle) -> Result<String, String> {
    // This is a placeholder for actual PDF generation logic
    // In a real app, you'd fetch data from DB and use printpdf
    let path = app_handle.path().app_data_dir().unwrap().join("report.pdf");
    Ok(format!("Relatório gerado em: {:?}", path))
}
