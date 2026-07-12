use std::path::Path;
use std::process::Command;

use crate::app::commits::contracts::CommitReader;
use crate::domain::commit::Commit;
use crate::domain::errors::AppError;
use crate::infrastructure::git::parse_commit_log::parse_commit_log;

pub struct GitCliCommitReader;

impl GitCliCommitReader {
    pub fn new() -> Self {
        Self
    }
}

impl CommitReader for GitCliCommitReader {
    fn read_commits(&self, repository_path: &Path) -> Result<Vec<Commit>, AppError> {
        let output = Command::new("git")
            .args([
                "log",
                "--branches",
                "--tags",
                "--remotes",
                "--topo-order",
                "--decorate=short",
                "--date=iso-strict",
                "--pretty=format:%H%x1f%P%x1f%D%x1f%an%x1f%ae%x1f%ad%x1f%s%x1e",
            ])
            .current_dir(repository_path)
            .output()
            .map_err(|error| AppError::IoError(error.to_string()))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            return Err(AppError::GitCommandFailed(stderr));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        parse_commit_log(&stdout)
    }
}
