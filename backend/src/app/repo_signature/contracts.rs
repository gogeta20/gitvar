use std::path::Path;

use crate::domain::errors::AppError;

pub trait RepoSignatureReader {
    fn read_signature(&self, repository_path: &Path) -> Result<String, AppError>;
}
