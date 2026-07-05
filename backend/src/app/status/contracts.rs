use std::path::Path;

use crate::domain::errors::AppError;
use crate::domain::working_status::WorkingStatus;

pub trait StatusReader {
    fn read_status(&self, repository_path: &Path) -> Result<WorkingStatus, AppError>;
}
