use std::path::Path;
use std::process::Command;

use crate::domain::errors::AppError;

pub fn read_commit_parents(repository_path: &Path, commit_id: &str) -> Result<Vec<String>, AppError> {
    let output = Command::new("git")
        .args(["log", "--pretty=%P", "-n", "1", commit_id])
        .current_dir(repository_path)
        .output()
        .map_err(|error| AppError::IoError(error.to_string()))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(AppError::GitCommandFailed(stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(stdout.trim().split_whitespace().map(String::from).collect())
}
