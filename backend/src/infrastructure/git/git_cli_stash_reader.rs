use std::path::Path;
use std::process::Command;

use crate::app::stash::contracts::StashReader;
use crate::domain::errors::AppError;
use crate::domain::stash_entry::StashEntry;
use crate::infrastructure::git::parse_stash_list::parse_stash_list;

pub struct GitCliStashReader;

impl GitCliStashReader {
    pub fn new() -> Self {
        Self
    }
}

impl StashReader for GitCliStashReader {
    fn read_stash(&self, repository_path: &Path) -> Result<Vec<StashEntry>, AppError> {
        let output = Command::new("git")
            .args(["stash", "list", "--format=%gd|%H|%h|%P|%cr|%s"])
            .current_dir(repository_path)
            .output()
            .map_err(|error| AppError::IoError(error.to_string()))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            return Err(AppError::GitCommandFailed(stderr));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        parse_stash_list(&stdout)
    }
}
