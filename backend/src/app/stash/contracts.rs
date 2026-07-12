use std::path::Path;

use crate::domain::errors::AppError;
use crate::domain::stash_entry::StashEntry;

pub trait StashReader {
    fn read_stash(&self, repository_path: &Path) -> Result<Vec<StashEntry>, AppError>;
}
