use std::path::Path;

use crate::app::file_diff::contracts::FileDiffReader;
use crate::domain::errors::AppError;

pub fn read_file_diff(
    file_diff_reader: &dyn FileDiffReader,
    repository_path: &Path,
    commit_id: &str,
    file_path: &str,
) -> Result<String, AppError> {
    file_diff_reader.read_file_diff(repository_path, commit_id, file_path)
}
