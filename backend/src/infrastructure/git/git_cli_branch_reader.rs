use std::path::Path;
use std::process::Command;

use crate::app::branches::contracts::BranchReader;
use crate::domain::branch::Branch;
use crate::domain::errors::AppError;
use crate::infrastructure::git::parse_branch_refs::parse_branch_refs;

pub struct GitCliBranchReader;

impl GitCliBranchReader {
    pub fn new() -> Self {
        Self
    }
}

impl BranchReader for GitCliBranchReader {
    fn read_branches(&self, repository_path: &Path) -> Result<Vec<Branch>, AppError> {
        let output = Command::new("git")
            .args([
                "for-each-ref",
                "refs/heads",
                "refs/remotes",
                "--format=%(refname)|%(refname:short)|%(objectname)",
            ])
            .current_dir(repository_path)
            .output()
            .map_err(|error| AppError::IoError(error.to_string()))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            return Err(AppError::GitCommandFailed(stderr));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        parse_branch_refs(&stdout)
    }
}
