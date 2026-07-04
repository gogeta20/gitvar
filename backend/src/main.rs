mod app;
mod domain;
mod infrastructure;
mod presentation;

use crate::infrastructure::git::GitCliBranchReader;
use crate::presentation::cli::run;
use crate::presentation::http::serve;

fn main() {
    let branch_reader = GitCliBranchReader::new();

    let command = std::env::args().nth(1);
    let result = match command.as_deref() {
        Some("serve") => serve(&branch_reader),
        _ => run(&branch_reader),
    };

    if let Err(error) = result {
        eprintln!("{error}");
        std::process::exit(1);
    }
}
