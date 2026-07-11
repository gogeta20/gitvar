use std::fs;
use std::path::Path;
use std::process::Command;

use crate::app::file_diff::contracts::FileDiffReader;
use crate::domain::errors::AppError;
use crate::domain::working_status::WORKING_CHANGES_COMMIT_ID;
use crate::infrastructure::git::read_commit_parents::read_commit_parents;

pub struct GitCliFileDiffReader;

impl GitCliFileDiffReader {
    pub fn new() -> Self {
        Self
    }
}

impl FileDiffReader for GitCliFileDiffReader {
    fn read_file_diff(
        &self,
        repository_path: &Path,
        commit_id: &str,
        file_path: &str,
    ) -> Result<String, AppError> {
        if commit_id == WORKING_CHANGES_COMMIT_ID {
            return read_working_directory_diff(repository_path, file_path);
        }

        let parents = read_commit_parents(repository_path, commit_id)?;

        let output = if parents.len() > 1 {
            Command::new("git")
                .args(["diff", "--no-color", &parents[0], commit_id, "--", file_path])
                .current_dir(repository_path)
                .output()
                .map_err(|error| AppError::IoError(error.to_string()))?
        } else {
            Command::new("git")
                .args(["show", "--no-color", commit_id, "--", file_path])
                .current_dir(repository_path)
                .output()
                .map_err(|error| AppError::IoError(error.to_string()))?
        };

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            return Err(AppError::GitCommandFailed(stderr));
        }

        let stdout = String::from_utf8_lossy(&output.stdout).into_owned();
        Ok(strip_commit_header(&stdout))
    }
}

fn read_working_directory_diff(repository_path: &Path, file_path: &str) -> Result<String, AppError> {
    let is_untracked = is_untracked_file(repository_path, file_path)?;

    if is_untracked {
        return read_untracked_file_as_diff(repository_path, file_path);
    }

    let output = Command::new("git")
        .args(["diff", "--no-color", "HEAD", "--", file_path])
        .current_dir(repository_path)
        .output()
        .map_err(|error| AppError::IoError(error.to_string()))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(AppError::GitCommandFailed(stderr));
    }

    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}

fn is_untracked_file(repository_path: &Path, file_path: &str) -> Result<bool, AppError> {
    let output = Command::new("git")
        .args(["status", "--porcelain", "--", file_path])
        .current_dir(repository_path)
        .output()
        .map_err(|error| AppError::IoError(error.to_string()))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(AppError::GitCommandFailed(stderr));
    }

    Ok(String::from_utf8_lossy(&output.stdout).starts_with("??"))
}

fn read_untracked_file_as_diff(repository_path: &Path, file_path: &str) -> Result<String, AppError> {
    let content = fs::read_to_string(repository_path.join(file_path))
        .map_err(|error| AppError::IoError(error.to_string()))?;

    let line_count = content.lines().count();
    let body = content
        .lines()
        .map(|line| format!("+{line}"))
        .collect::<Vec<_>>()
        .join("\n");

    Ok(format!(
        "--- /dev/null\n+++ b/{file_path}\n@@ -0,0 +1,{line_count} @@\n{body}"
    ))
}

fn strip_commit_header(show_output: &str) -> String {
    match show_output.find("diff --git") {
        Some(index) => show_output[index..].to_string(),
        None => show_output.to_string(),
    }
}
