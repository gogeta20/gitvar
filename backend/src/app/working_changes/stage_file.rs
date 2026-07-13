use std::path::Path;

use crate::app::working_changes::contracts::WorkingChangesWriter;
use crate::domain::errors::AppError;

pub fn stage_file(
    working_changes_writer: &dyn WorkingChangesWriter,
    repository_path: &Path,
    file_path: &str,
) -> Result<(), AppError> {
    working_changes_writer.stage_file(repository_path, file_path)
}
