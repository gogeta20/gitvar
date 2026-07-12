use std::path::Path;

use crate::app::directory_browser::contracts::DirectoryBrowser;
use crate::domain::directory_entry::DirectoryListing;
use crate::domain::errors::AppError;

pub fn read_directory_listing(
    directory_browser: &dyn DirectoryBrowser,
    path: &Path,
) -> Result<DirectoryListing, AppError> {
    directory_browser.list_directory(path)
}
