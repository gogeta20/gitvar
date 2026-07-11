use std::path::Path;
use std::process::Command;

use crate::app::commit_files::contracts::CommitFilesReader;
use crate::domain::errors::AppError;
use crate::domain::file_change::FileChange;
use crate::infrastructure::git::parse_name_status::parse_name_status;
use crate::infrastructure::git::read_commit_parents::read_commit_parents;

pub struct GitCliCommitFilesReader;

impl GitCliCommitFilesReader {
    pub fn new() -> Self {
        Self
    }
}

impl CommitFilesReader for GitCliCommitFilesReader {
    fn read_commit_files(
        &self,
        repository_path: &Path,
        commit_id: &str,
    ) -> Result<Vec<FileChange>, AppError> {
        let parents = read_commit_parents(repository_path, commit_id)?;

        let output = if parents.len() > 1 {
            Command::new("git")
                .args(["diff", "--no-color", "--name-status", &parents[0], commit_id])
                .current_dir(repository_path)
                .output()
        } else {
            Command::new("git")
                .args(["diff-tree", "--no-commit-id", "--name-status", "-r", "--root", commit_id])
                .current_dir(repository_path)
                .output()
        }
        .map_err(|error| AppError::IoError(error.to_string()))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            return Err(AppError::GitCommandFailed(stderr));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        Ok(parse_name_status(&stdout))
    }
}
