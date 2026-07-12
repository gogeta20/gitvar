use std::path::Path;

use crate::domain::directory_entry::DirectoryListing;
use crate::domain::errors::AppError;

pub trait DirectoryBrowser {
    fn list_directory(&self, path: &Path) -> Result<DirectoryListing, AppError>;
}
