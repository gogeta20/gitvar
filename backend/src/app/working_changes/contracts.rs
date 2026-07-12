use std::path::Path;

use crate::domain::errors::AppError;

pub trait WorkingChangesWriter {
    fn stage_file(&self, repository_path: &Path, file_path: &str) -> Result<(), AppError>;
    fn unstage_file(&self, repository_path: &Path, file_path: &str) -> Result<(), AppError>;
    fn discard_file(&self, repository_path: &Path, file_path: &str) -> Result<(), AppError>;
    fn stage_hunk(&self, repository_path: &Path, file_path: &str, hunk: &str) -> Result<(), AppError>;
    fn discard_hunk(&self, repository_path: &Path, file_path: &str, hunk: &str) -> Result<(), AppError>;
    fn unstage_hunk(&self, repository_path: &Path, file_path: &str, hunk: &str) -> Result<(), AppError>;
}
