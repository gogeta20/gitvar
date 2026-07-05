use std::path::Path;

use crate::app::status::contracts::StatusReader;
use crate::domain::errors::AppError;
use crate::domain::working_status::WorkingStatus;

pub fn read_status(
    status_reader: &dyn StatusReader,
    repository_path: &Path,
) -> Result<WorkingStatus, AppError> {
    status_reader.read_status(repository_path)
}
