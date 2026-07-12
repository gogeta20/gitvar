use std::path::Path;

use crate::domain::errors::AppError;

pub trait FileDiffReader {
    fn read_file_diff(
        &self,
        repository_path: &Path,
        commit_id: &str,
        file_path: &str,
        staged: bool,
    ) -> Result<String, AppError>;
}
