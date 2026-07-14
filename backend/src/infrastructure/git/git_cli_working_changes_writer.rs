use std::io::Write;
use std::path::Path;
use std::process::{Command, Stdio};

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

    fn stage_hunk(&self, repository_path: &Path, file_path: &str, hunk: &str) -> Result<(), AppError> {
        let patch = build_hunk_patch(repository_path, file_path, hunk)?;
        apply_patch(repository_path, &patch, &["--cached"])
    }

    fn discard_hunk(&self, repository_path: &Path, file_path: &str, hunk: &str) -> Result<(), AppError> {
        let patch = build_hunk_patch(repository_path, file_path, hunk)?;
        apply_patch(repository_path, &patch, &["-R"])
    }

    fn unstage_hunk(&self, repository_path: &Path, file_path: &str, hunk: &str) -> Result<(), AppError> {
        let patch = build_hunk_patch(repository_path, file_path, hunk)?;
        apply_patch(repository_path, &patch, &["-R", "--cached"])
    }

    fn stage_all(&self, repository_path: &Path) -> Result<(), AppError> {
        run_git(repository_path, &["add", "-A"])
    }

    fn discard_all(&self, repository_path: &Path) -> Result<(), AppError> {
        run_git(repository_path, &["reset", "--hard", "HEAD"])?;
        run_git(repository_path, &["clean", "-fd"])
    }
}

fn build_hunk_patch(repository_path: &Path, file_path: &str, hunk: &str) -> Result<String, AppError> {
    let is_new_file = is_untracked(repository_path, file_path)?;
    let old_path = if is_new_file {
        "/dev/null".to_string()
    } else {
        format!("a/{file_path}")
    };
    let hunk = hunk.trim_end_matches('\n');

    Ok(format!(
        "diff --git a/{file_path} b/{file_path}\n--- {old_path}\n+++ b/{file_path}\n{hunk}\n"
    ))
}

fn is_untracked(repository_path: &Path, file_path: &str) -> Result<bool, AppError> {
    let output = Command::new("git")
        .args(["status", "--porcelain", "--untracked-files=all", "--", file_path])
        .current_dir(repository_path)
        .output()
        .map_err(|error| AppError::IoError(error.to_string()))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(AppError::GitCommandFailed(stderr));
    }

    Ok(String::from_utf8_lossy(&output.stdout).starts_with("??"))
}

fn apply_patch(repository_path: &Path, patch: &str, extra_args: &[&str]) -> Result<(), AppError> {
    let mut command = Command::new("git");
    command.arg("apply");
    command.args(extra_args);
    command.current_dir(repository_path);
    command.stdin(Stdio::piped());
    command.stdout(Stdio::piped());
    command.stderr(Stdio::piped());

    let mut child = command
        .spawn()
        .map_err(|error| AppError::IoError(error.to_string()))?;

    {
        let stdin = child
            .stdin
            .as_mut()
            .ok_or_else(|| AppError::IoError("Failed to open git apply stdin.".to_string()))?;
        stdin
            .write_all(patch.as_bytes())
            .map_err(|error| AppError::IoError(error.to_string()))?;
    }

    let output = child
        .wait_with_output()
        .map_err(|error| AppError::IoError(error.to_string()))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(AppError::GitCommandFailed(stderr));
    }

    Ok(())
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
