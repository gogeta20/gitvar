use std::path::Path;
use std::process::Command;

use crate::app::status::contracts::StatusReader;
use crate::domain::errors::AppError;
use crate::domain::working_status::WorkingStatus;
use crate::infrastructure::git::parse_porcelain_status::parse_porcelain_status;

pub struct GitCliStatusReader;

impl GitCliStatusReader {
    pub fn new() -> Self {
        Self
    }
}

impl StatusReader for GitCliStatusReader {
    fn read_status(&self, repository_path: &Path) -> Result<WorkingStatus, AppError> {
        let porcelain_output = Command::new("git")
            .args(["status", "--porcelain"])
            .current_dir(repository_path)
            .output()
            .map_err(|error| AppError::IoError(error.to_string()))?;

        if !porcelain_output.status.success() {
            let stderr = String::from_utf8_lossy(&porcelain_output.stderr)
                .trim()
                .to_string();
            return Err(AppError::GitCommandFailed(stderr));
        }

        let porcelain_stdout = String::from_utf8_lossy(&porcelain_output.stdout);
        let is_dirty = !porcelain_stdout.trim().is_empty();
        let changed_files = parse_porcelain_status(&porcelain_stdout);

        let head_output = Command::new("git")
            .args(["rev-parse", "HEAD"])
            .current_dir(repository_path)
            .output()
            .map_err(|error| AppError::IoError(error.to_string()))?;

        if !head_output.status.success() {
            let stderr = String::from_utf8_lossy(&head_output.stderr)
                .trim()
                .to_string();
            return Err(AppError::GitCommandFailed(stderr));
        }

        let head_commit_id = String::from_utf8_lossy(&head_output.stdout)
            .trim()
            .to_string();

        Ok(WorkingStatus {
            is_dirty,
            head_commit_id,
            changed_files,
        })
    }
}
