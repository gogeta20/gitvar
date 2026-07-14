use std::path::Path;

use crate::app::working_changes::contracts::WorkingChangesWriter;
use crate::domain::errors::AppError;

pub fn stage_all(
    working_changes_writer: &dyn WorkingChangesWriter,
    repository_path: &Path,
) -> Result<(), AppError> {
    working_changes_writer.stage_all(repository_path)
}
