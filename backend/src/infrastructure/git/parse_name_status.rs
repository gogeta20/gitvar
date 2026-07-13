use crate::domain::file_change::{FileChange, FileChangeType};

pub fn parse_name_status(output: &str) -> Vec<FileChange> {
    output
        .lines()
        .filter(|line| !line.is_empty())
        .filter_map(parse_name_status_line)
        .collect()
}

fn parse_name_status_line(line: &str) -> Option<FileChange> {
    let mut fields = line.split('\t');
    let status_code = fields.next()?;
    let first_path = fields.next()?;
    let path = fields.next().unwrap_or(first_path);

    let change_type = match status_code.chars().next()? {
        'A' => FileChangeType::Added,
        'D' => FileChangeType::Deleted,
        'R' => FileChangeType::Renamed,
        _ => FileChangeType::Modified,
    };

    Some(FileChange {
        path: path.to_string(),
        change_type,
        is_staged: false,
    })
}
