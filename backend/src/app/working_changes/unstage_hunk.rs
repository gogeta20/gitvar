use std::path::Path;

use crate::app::working_changes::contracts::WorkingChangesWriter;
use crate::domain::errors::AppError;

pub fn unstage_hunk(
    working_changes_writer: &dyn WorkingChangesWriter,
    repository_path: &Path,
    file_path: &str,
    hunk: &str,
) -> Result<(), AppError> {
    working_changes_writer.unstage_hunk(repository_path, file_path, hunk)
}
