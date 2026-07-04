use crate::domain::commit::Commit;
use crate::domain::errors::AppError;

const FIELD_SEPARATOR: char = '\u{1f}';
const RECORD_SEPARATOR: char = '\u{1e}';

pub fn parse_commit_log(raw_output: &str) -> Result<Vec<Commit>, AppError> {
    raw_output
        .split(RECORD_SEPARATOR)
        .filter(|record| !record.trim().is_empty())
        .map(parse_commit_record)
        .collect()
}

fn parse_commit_record(record: &str) -> Result<Commit, AppError> {
    let fields = record
        .split(FIELD_SEPARATOR)
        .map(str::trim)
        .collect::<Vec<_>>();

    if fields.len() != 7 {
        return Err(AppError::ParseError(format!(
            "Expected 7 fields in commit record, got {}: {record}",
            fields.len()
        )));
    }

    let parents = if fields[1].is_empty() {
        Vec::new()
    } else {
        fields[1].split_whitespace().map(str::to_string).collect()
    };

    let refs = if fields[2].is_empty() {
        Vec::new()
    } else {
        fields[2]
            .split(',')
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(str::to_string)
            .collect()
    };

    Ok(Commit {
        id: fields[0].to_string(),
        parents,
        refs,
        author_name: fields[3].to_string(),
        author_email: fields[4].to_string(),
        authored_at: fields[5].to_string(),
        message: fields[6].to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::parse_commit_log;

    #[test]
    fn parses_commit_log_records() {
        let raw = concat!(
            "abc123\x1fdef456\x1fHEAD -> main, origin/main\x1fMau\x1fmau@example.dev\x1f2026-07-04T20:00:00+02:00\x1fMessage\x1e",
            "def456\x1f\x1fmain\x1fMau\x1fmau@example.dev\x1f2026-07-04T19:00:00+02:00\x1fInitial\x1e"
        );

        let commits = parse_commit_log(raw).expect("commit log should parse");

        assert_eq!(commits.len(), 2);
        assert_eq!(commits[0].parents, vec!["def456"]);
        assert_eq!(commits[0].refs, vec!["HEAD -> main", "origin/main"]);
        assert!(commits[1].parents.is_empty());
    }
}
