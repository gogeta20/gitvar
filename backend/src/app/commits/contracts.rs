use std::path::Path;

use crate::domain::commit::Commit;
use crate::domain::errors::AppError;

pub trait CommitReader {
    fn read_commits(&self, repository_path: &Path) -> Result<Vec<Commit>, AppError>;
}
