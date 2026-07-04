mod app;
mod domain;
mod infrastructure;
mod presentation;

use crate::infrastructure::git::GitCliBranchReader;
use crate::presentation::cli::run;

fn main() {
    let branch_reader = GitCliBranchReader::new();

    if let Err(error) = run(&branch_reader) {
        eprintln!("{error}");
        std::process::exit(1);
    }
}
