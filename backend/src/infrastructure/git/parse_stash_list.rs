use crate::domain::errors::AppError;
use crate::domain::stash_entry::StashEntry;

pub fn parse_stash_list(raw_output: &str) -> Result<Vec<StashEntry>, AppError> {
    raw_output
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(parse_stash_line)
        .collect()
}

fn parse_stash_line(line: &str) -> Result<StashEntry, AppError> {
    let mut parts = line.split('|');

    let reference = parts
        .next()
        .ok_or_else(|| AppError::ParseError(format!("Missing stash reference in line: {line}")))?;
    let commit_id = parts
        .next()
        .ok_or_else(|| AppError::ParseError(format!("Missing commit id in line: {line}")))?;
    let short_commit_id = parts
        .next()
        .ok_or_else(|| AppError::ParseError(format!("Missing short commit id in line: {line}")))?;
    let relative_date = parts
        .next()
        .ok_or_else(|| AppError::ParseError(format!("Missing relative date in line: {line}")))?;
    let message = parts
        .next()
        .ok_or_else(|| AppError::ParseError(format!("Missing message in line: {line}")))?;

    let index = reference
        .trim_start_matches("stash@{")
        .trim_end_matches('}')
        .parse::<u32>()
        .map_err(|_| AppError::ParseError(format!("Invalid stash index in reference: {reference}")))?;

    Ok(StashEntry {
        reference: reference.to_string(),
        index,
        commit_id: commit_id.to_string(),
        short_commit_id: short_commit_id.to_string(),
        relative_date: relative_date.to_string(),
        message: message.to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::parse_stash_list;

    #[test]
    fn parses_stash_entries() {
        let raw = "\
stash@{0}|abc123|abc123a|2 hours ago|WIP on main: abc123a message\n\
stash@{1}|def456|def456b|3 days ago|On feature/x: custom message\n";

        let entries = parse_stash_list(raw).expect("stash entries should parse");

        assert_eq!(entries.len(), 2);
        assert_eq!(entries[0].reference, "stash@{0}");
        assert_eq!(entries[0].index, 0);
        assert_eq!(entries[1].index, 1);
        assert_eq!(entries[1].message, "On feature/x: custom message");
    }
}
