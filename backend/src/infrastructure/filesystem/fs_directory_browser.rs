use std::fs;
use std::path::Path;

use crate::app::directory_browser::contracts::DirectoryBrowser;
use crate::domain::directory_entry::{DirectoryEntry, DirectoryListing};
use crate::domain::errors::AppError;

pub struct FsDirectoryBrowser;

impl FsDirectoryBrowser {
    pub fn new() -> Self {
        Self
    }
}

impl DirectoryBrowser for FsDirectoryBrowser {
    fn list_directory(&self, path: &Path) -> Result<DirectoryListing, AppError> {
        let read_dir = fs::read_dir(path).map_err(|error| AppError::IoError(error.to_string()))?;

        let mut entries = Vec::new();

        for entry in read_dir {
            let entry = entry.map_err(|error| AppError::IoError(error.to_string()))?;
            let entry_path = entry.path();

            if !entry_path.is_dir() {
                continue;
            }

            let name = entry.file_name().to_string_lossy().into_owned();

            if name.starts_with('.') {
                continue;
            }

            let is_git_repo = entry_path.join(".git").exists();

            entries.push(DirectoryEntry {
                name,
                path: entry_path.to_string_lossy().into_owned(),
                is_git_repo,
            });
        }

        entries.sort_by(|left, right| left.name.to_lowercase().cmp(&right.name.to_lowercase()));

        Ok(DirectoryListing {
            current_path: path.to_string_lossy().into_owned(),
            parent_path: path
                .parent()
                .map(|parent| parent.to_string_lossy().into_owned()),
            entries,
        })
    }
}
