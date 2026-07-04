use std::env;
use std::path::{Path, PathBuf};

use crate::app::branches::contracts::BranchReader;
use crate::app::branches::read_branches::read_branches;
use crate::domain::errors::AppError;

pub fn run(branch_reader: &dyn BranchReader) -> Result<(), AppError> {
    let repository_path = resolve_repository_path()?;
    let branches = read_branches(branch_reader, &repository_path)?;

    println!("Repository: {}", repository_path.display());
    println!("Branches found: {}", branches.len());

    for branch in branches {
        let scope = if branch.is_remote { "remote" } else { "local " };
        println!(
            "[{scope}] {} -> {}",
            branch.name,
            &branch.target_commit[..7.min(branch.target_commit.len())]
        );
    }

    Ok(())
}

fn resolve_repository_path() -> Result<PathBuf, AppError> {
    if let Some(path) = env::args().nth(1) {
        return Ok(PathBuf::from(path));
    }

    let current_dir = env::current_dir().map_err(|error| AppError::IoError(error.to_string()))?;

    let parent = current_dir
        .parent()
        .ok_or_else(|| AppError::IoError("Unable to resolve parent directory.".to_string()))?;

    Ok(Path::new(parent).to_path_buf())
}
