use std::path::Path;

use crate::app::commit_files::contracts::CommitFilesReader;
use crate::domain::errors::AppError;
use crate::domain::file_change::FileChange;

pub fn read_commit_files(
    commit_files_reader: &dyn CommitFilesReader,
    repository_path: &Path,
    commit_id: &str,
) -> Result<Vec<FileChange>, AppError> {
    commit_files_reader.read_commit_files(repository_path, commit_id)
}
