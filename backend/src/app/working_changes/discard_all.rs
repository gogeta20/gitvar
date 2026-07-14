use std::path::Path;

use crate::app::working_changes::contracts::WorkingChangesWriter;
use crate::domain::errors::AppError;

pub fn discard_all(
    working_changes_writer: &dyn WorkingChangesWriter,
    repository_path: &Path,
) -> Result<(), AppError> {
    working_changes_writer.discard_all(repository_path)
}
