use std::path::Path;

use crate::app::repo_signature::contracts::RepoSignatureReader;
use crate::domain::errors::AppError;

pub fn read_repo_signature(
    repo_signature_reader: &dyn RepoSignatureReader,
    repository_path: &Path,
) -> Result<String, AppError> {
    repo_signature_reader.read_signature(repository_path)
}
