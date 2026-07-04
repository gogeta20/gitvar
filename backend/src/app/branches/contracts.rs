use std::path::Path;

use crate::domain::branch::Branch;
use crate::domain::errors::AppError;

pub trait BranchReader {
    fn read_branches(&self, repository_path: &Path) -> Result<Vec<Branch>, AppError>;
}
