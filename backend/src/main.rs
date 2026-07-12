use gitmap_backend::infrastructure::filesystem::FsDirectoryBrowser;
use gitmap_backend::infrastructure::filesystem::FsRepoSignatureReader;
use gitmap_backend::infrastructure::git::GitCliBranchReader;
use gitmap_backend::infrastructure::git::GitCliCommitFilesReader;
use gitmap_backend::infrastructure::git::GitCliCommitReader;
use gitmap_backend::infrastructure::git::GitCliFileDiffReader;
use gitmap_backend::infrastructure::git::GitCliStashReader;
use gitmap_backend::infrastructure::git::GitCliStatusReader;
use gitmap_backend::infrastructure::git::GitCliWorkingChangesWriter;
use gitmap_backend::presentation::cli::run;
use gitmap_backend::presentation::http::serve;

fn main() {
    let branch_reader = GitCliBranchReader::new();
    let commit_reader = GitCliCommitReader::new();
    let status_reader = GitCliStatusReader::new();
    let commit_files_reader = GitCliCommitFilesReader::new();
    let file_diff_reader = GitCliFileDiffReader::new();
    let stash_reader = GitCliStashReader::new();
    let directory_browser = FsDirectoryBrowser::new();
    let repo_signature_reader = FsRepoSignatureReader::new();
    let working_changes_writer = GitCliWorkingChangesWriter::new();

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
            &repo_signature_reader,
            &working_changes_writer,
        ),
        _ => run(&branch_reader),
    };

    if let Err(error) = result {
        eprintln!("{error}");
        std::process::exit(1);
    }
}
