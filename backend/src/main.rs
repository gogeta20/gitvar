mod app;
mod domain;
mod infrastructure;
mod presentation;

use crate::infrastructure::filesystem::FsDirectoryBrowser;
use crate::infrastructure::git::GitCliBranchReader;
use crate::infrastructure::git::GitCliCommitFilesReader;
use crate::infrastructure::git::GitCliCommitReader;
use crate::infrastructure::git::GitCliFileDiffReader;
use crate::infrastructure::git::GitCliStashReader;
use crate::infrastructure::git::GitCliStatusReader;
use crate::presentation::cli::run;
use crate::presentation::http::serve;

fn main() {
    let branch_reader = GitCliBranchReader::new();
    let commit_reader = GitCliCommitReader::new();
    let status_reader = GitCliStatusReader::new();
    let commit_files_reader = GitCliCommitFilesReader::new();
    let file_diff_reader = GitCliFileDiffReader::new();
    let stash_reader = GitCliStashReader::new();
    let directory_browser = FsDirectoryBrowser::new();

    let command = std::env::args().nth(1);
    let result = match command.as_deref() {
        Some("serve") => serve(
            &branch_reader,
            &commit_reader,
            &status_reader,
            &commit_files_reader,
            &file_diff_reader,
            &stash_reader,
            &directory_browser,
        ),
        _ => run(&branch_reader),
    };

    if let Err(error) = result {
        eprintln!("{error}");
        std::process::exit(1);
    }
}
