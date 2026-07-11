use std::path::Path;

use crate::domain::errors::AppError;
use crate::domain::file_change::FileChange;

pub trait CommitFilesReader {
    fn read_commit_files(
        &self,
        repository_path: &Path,
        commit_id: &str,
    ) -> Result<Vec<FileChange>, AppError>;
}
