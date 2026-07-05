use crate::domain::branch::Branch;
use crate::domain::errors::AppError;

pub fn parse_branch_refs(raw_output: &str) -> Result<Vec<Branch>, AppError> {
    raw_output
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(parse_branch_line)
        .collect()
}

fn parse_branch_line(line: &str) -> Result<Branch, AppError> {
    let mut parts = line.split('|');

    let full_ref = parts
        .next()
        .ok_or_else(|| AppError::ParseError(format!("Missing full ref in line: {line}")))?;
    let short_name = parts
        .next()
        .ok_or_else(|| AppError::ParseError(format!("Missing short name in line: {line}")))?;
    let is_current = parts
        .next()
        .ok_or_else(|| AppError::ParseError(format!("Missing current flag in line: {line}")))?;
    let target_commit = parts
        .next()
        .ok_or_else(|| AppError::ParseError(format!("Missing target commit in line: {line}")))?;

    if parts.next().is_some() {
        return Err(AppError::ParseError(format!(
            "Unexpected extra fields in line: {line}"
        )));
    }

    Ok(Branch {
        name: short_name.to_string(),
        full_ref: full_ref.to_string(),
        is_remote: full_ref.starts_with("refs/remotes/"),
        is_current: is_current == "true",
        target_commit: target_commit.to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::parse_branch_refs;

    #[test]
    fn parses_local_and_remote_refs() {
        let raw = "\
refs/heads/main|main|true|abc123\n\
refs/remotes/origin/main|origin/main|false|def456\n";

        let branches = parse_branch_refs(raw).expect("branches should parse");

        assert_eq!(branches.len(), 2);
        assert_eq!(branches[0].name, "main");
        assert!(!branches[0].is_remote);
        assert!(branches[0].is_current);
        assert_eq!(branches[1].name, "origin/main");
        assert!(branches[1].is_remote);
        assert!(!branches[1].is_current);
    }
}
