use std::path::Path;
use std::process::Command;

use crate::app::working_changes::contracts::WorkingChangesWriter;
use crate::domain::errors::AppError;

pub struct GitCliWorkingChangesWriter;

impl GitCliWorkingChangesWriter {
    pub fn new() -> Self {
        Self
    }
}

impl WorkingChangesWriter for GitCliWorkingChangesWriter {
    fn stage_file(&self, repository_path: &Path, file_path: &str) -> Result<(), AppError> {
        run_git(repository_path, &["add", "--", file_path])
    }

    fn unstage_file(&self, repository_path: &Path, file_path: &str) -> Result<(), AppError> {
        run_git(repository_path, &["restore", "--staged", "--", file_path])
    }

    fn discard_file(&self, repository_path: &Path, file_path: &str) -> Result<(), AppError> {
        let checkout_result = run_git(repository_path, &["checkout", "--", file_path]);

        if checkout_result.is_ok() {
            return Ok(());
        }

        let absolute_path = repository_path.join(file_path);

        std::fs::remove_file(&absolute_path).map_err(|error| AppError::IoError(error.to_string()))
    }
}

fn run_git(repository_path: &Path, args: &[&str]) -> Result<(), AppError> {
    let output = Command::new("git")
        .args(args)
        .current_dir(repository_path)
        .output()
        .map_err(|error| AppError::IoError(error.to_string()))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(AppError::GitCommandFailed(stderr));
    }

    Ok(())
}
