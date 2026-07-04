use std::path::Path;

use crate::app::commits::contracts::CommitReader;
use crate::domain::commit::Commit;
use crate::domain::errors::AppError;

pub fn read_commits(
    commit_reader: &dyn CommitReader,
    repository_path: &Path,
) -> Result<Vec<Commit>, AppError> {
    commit_reader.read_commits(repository_path)
}
