use std::path::Path;

use crate::app::stash::contracts::StashReader;
use crate::domain::errors::AppError;
use crate::domain::stash_entry::StashEntry;

pub fn read_stash(
    stash_reader: &dyn StashReader,
    repository_path: &Path,
) -> Result<Vec<StashEntry>, AppError> {
    stash_reader.read_stash(repository_path)
}
