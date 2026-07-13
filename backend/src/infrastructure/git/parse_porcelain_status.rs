use crate::domain::file_change::{FileChange, FileChangeType};

pub fn parse_porcelain_status(output: &str) -> Vec<FileChange> {
    output
        .lines()
        .filter(|line| !line.is_empty())
        .flat_map(parse_porcelain_line)
        .collect()
}

fn parse_porcelain_line(line: &str) -> Vec<FileChange> {
    if line.len() < 4 {
        return Vec::new();
    }

    let status_code = &line[0..2];
    let raw_path = &line[3..];

    let path = raw_path
        .split_once(" -> ")
        .map(|(_, renamed_to)| renamed_to)
        .unwrap_or(raw_path)
        .to_string();

    if status_code == "??" {
        return vec![FileChange {
            path,
            change_type: FileChangeType::Untracked,
            is_staged: false,
        }];
    }

    let mut changes = Vec::new();
    let mut chars = status_code.chars();
    let index_status = chars.next().unwrap_or(' ');
    let worktree_status = chars.next().unwrap_or(' ');

    if let Some(change_type) = change_type_from_code(index_status) {
        changes.push(FileChange {
            path: path.clone(),
            change_type,
            is_staged: true,
        });
    }

    if let Some(change_type) = change_type_from_code(worktree_status) {
        changes.push(FileChange {
            path,
            change_type,
            is_staged: false,
        });
    }

    changes
}

fn change_type_from_code(code: char) -> Option<FileChangeType> {
    match code {
        'A' => Some(FileChangeType::Added),
        'D' => Some(FileChangeType::Deleted),
        'R' => Some(FileChangeType::Renamed),
        'M' => Some(FileChangeType::Modified),
        _ => None,
    }
}
