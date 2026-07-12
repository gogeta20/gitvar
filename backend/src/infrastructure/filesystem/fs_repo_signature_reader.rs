use std::fs::Metadata;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use crate::app::repo_signature::contracts::RepoSignatureReader;
use crate::domain::errors::AppError;

pub struct FsRepoSignatureReader;

impl FsRepoSignatureReader {
    pub fn new() -> Self {
        Self
    }
}

impl RepoSignatureReader for FsRepoSignatureReader {
    fn read_signature(&self, repository_path: &Path) -> Result<String, AppError> {
        let git_dir = repository_path.join(".git");
        let mut latest_nanos: u128 = 0;
        let mut entry_count: u64 = 0;

        for path in [
            git_dir.join("HEAD"),
            git_dir.join("index"),
            git_dir.join("packed-refs"),
        ] {
            if let Ok(metadata) = std::fs::metadata(&path) {
                accumulate(&metadata, &mut latest_nanos, &mut entry_count);
            }
        }

        for subdirectory in ["refs", "logs"] {
            walk_directory(&git_dir.join(subdirectory), &mut latest_nanos, &mut entry_count);
        }

        Ok(format!("{latest_nanos}:{entry_count}"))
    }
}

fn accumulate(metadata: &Metadata, latest_nanos: &mut u128, entry_count: &mut u64) {
    *entry_count += 1;

    if let Ok(modified) = metadata.modified() {
        if let Ok(duration) = modified.duration_since(UNIX_EPOCH) {
            let nanos = duration.as_nanos();
            if nanos > *latest_nanos {
                *latest_nanos = nanos;
            }
        }
    }
}

fn walk_directory(directory: &PathBuf, latest_nanos: &mut u128, entry_count: &mut u64) {
    let Ok(entries) = std::fs::read_dir(directory) else {
        return;
    };

    for entry in entries.flatten() {
        let Ok(metadata) = entry.metadata() else {
            continue;
        };

        if metadata.is_dir() {
            walk_directory(&entry.path(), latest_nanos, entry_count);
        } else {
            accumulate(&metadata, latest_nanos, entry_count);
        }
    }
}
