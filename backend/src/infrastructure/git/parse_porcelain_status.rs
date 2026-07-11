use crate::domain::file_change::{FileChange, FileChangeType};

pub fn parse_porcelain_status(output: &str) -> Vec<FileChange> {
    output
        .lines()
        .filter(|line| !line.is_empty())
        .filter_map(parse_porcelain_line)
        .collect()
}

fn parse_porcelain_line(line: &str) -> Option<FileChange> {
    if line.len() < 4 {
        return None;
    }

    let status_code = &line[0..2];
    let raw_path = &line[3..];

    let path = raw_path
        .split_once(" -> ")
        .map(|(_, renamed_to)| renamed_to)
        .unwrap_or(raw_path)
        .to_string();

    let change_type = if status_code == "??" {
        FileChangeType::Untracked
    } else if status_code.contains('R') {
        FileChangeType::Renamed
    } else if status_code.contains('D') {
        FileChangeType::Deleted
    } else if status_code.contains('A') {
        FileChangeType::Added
    } else {
        FileChangeType::Modified
    };

    Some(FileChange { path, change_type })
}
