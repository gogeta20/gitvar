use std::path::Path;

use crate::app::branches::contracts::BranchReader;
use crate::domain::branch::Branch;
use crate::domain::errors::AppError;

pub fn read_branches(
    branch_reader: &dyn BranchReader,
    repository_path: &Path,
) -> Result<Vec<Branch>, AppError> {
    branch_reader.read_branches(repository_path)
}
