use std::io::{Read, Write};
use std::net::TcpListener;
use std::path::PathBuf;

use crate::app::branches::contracts::BranchReader;
use crate::app::branches::read_branches::read_branches;
use crate::app::commit_files::contracts::CommitFilesReader;
use crate::app::commit_files::read_commit_files::read_commit_files;
use crate::app::commits::contracts::CommitReader;
use crate::app::commits::read_commits::read_commits;
use crate::app::file_diff::contracts::FileDiffReader;
use crate::app::file_diff::read_file_diff::read_file_diff;
use crate::app::stash::contracts::StashReader;
use crate::app::stash::read_stash::read_stash;
use crate::app::status::contracts::StatusReader;
use crate::app::status::read_status::read_status;
use crate::domain::branch::Branch;
use crate::domain::commit::Commit;
use crate::domain::errors::AppError;
use crate::domain::file_change::{FileChange, FileChangeType};
use crate::domain::stash_entry::StashEntry;
use crate::domain::working_status::WorkingStatus;

pub fn serve(
    branch_reader: &dyn BranchReader,
    commit_reader: &dyn CommitReader,
    status_reader: &dyn StatusReader,
    commit_files_reader: &dyn CommitFilesReader,
    file_diff_reader: &dyn FileDiffReader,
    stash_reader: &dyn StashReader,
) -> Result<(), AppError> {
    let listener = TcpListener::bind("0.0.0.0:7879")
        .map_err(|error| AppError::IoError(error.to_string()))?;

    println!("GitMap backend listening on http://0.0.0.0:7879");

    for stream in listener.incoming() {
        let mut stream = stream.map_err(|error| AppError::IoError(error.to_string()))?;
        let mut buffer = [0_u8; 4096];

        let bytes_read = stream
            .read(&mut buffer)
            .map_err(|error| AppError::IoError(error.to_string()))?;

        if bytes_read == 0 {
            continue;
        }

        let request = String::from_utf8_lossy(&buffer[..bytes_read]);
        let response = route_request(
            &request,
            branch_reader,
            commit_reader,
            status_reader,
            commit_files_reader,
            file_diff_reader,
            stash_reader,
        );

        stream
            .write_all(response.as_bytes())
            .map_err(|error| AppError::IoError(error.to_string()))?;
    }

    Ok(())
}

fn route_request(
    request: &str,
    branch_reader: &dyn BranchReader,
    commit_reader: &dyn CommitReader,
    status_reader: &dyn StatusReader,
    commit_files_reader: &dyn CommitFilesReader,
    file_diff_reader: &dyn FileDiffReader,
    stash_reader: &dyn StashReader,
) -> String {
    let Some(first_line) = request.lines().next() else {
        return json_response(400, r#"{"error":"Invalid request."}"#);
    };

    let mut parts = first_line.split_whitespace();
    let method = parts.next().unwrap_or_default();
    let target = parts.next().unwrap_or_default();

    if method != "GET" {
        return json_response(405, r#"{"error":"Method not allowed."}"#);
    }

    if target.starts_with("/api/branches") {
        return handle_branch_request(target, branch_reader);
    }

    if target.starts_with("/api/commits") {
        return handle_commit_request(target, commit_reader);
    }

    if target.starts_with("/api/status") {
        return handle_status_request(target, status_reader);
    }

    if target.starts_with("/api/commit-files") {
        return handle_commit_files_request(target, commit_files_reader);
    }

    if target.starts_with("/api/file-diff") {
        return handle_file_diff_request(target, file_diff_reader);
    }

    if target.starts_with("/api/stash") {
        return handle_stash_request(target, stash_reader);
    }

    json_response(404, r#"{"error":"Not found."}"#)
}

fn handle_branch_request(target: &str, branch_reader: &dyn BranchReader) -> String {
    let Some(path) = extract_repo_path(target) else {
        return json_response(400, r#"{"error":"Missing repoPath query parameter."}"#);
    };

    match read_branches(branch_reader, &path) {
        Ok(branches) => json_response(200, &branches_to_json(&branches)),
        Err(error) => json_response(
            500,
            &format!(r#"{{"error":"{}"}}"#, escape_json(&error.to_string())),
        ),
    }
}

fn handle_commit_request(target: &str, commit_reader: &dyn CommitReader) -> String {
    let Some(path) = extract_repo_path(target) else {
        return json_response(400, r#"{"error":"Missing repoPath query parameter."}"#);
    };

    match read_commits(commit_reader, &path) {
        Ok(commits) => json_response(200, &commits_to_json(&commits)),
        Err(error) => json_response(
            500,
            &format!(r#"{{"error":"{}"}}"#, escape_json(&error.to_string())),
        ),
    }
}

fn handle_status_request(target: &str, status_reader: &dyn StatusReader) -> String {
    let Some(path) = extract_repo_path(target) else {
        return json_response(400, r#"{"error":"Missing repoPath query parameter."}"#);
    };

    match read_status(status_reader, &path) {
        Ok(status) => json_response(200, &status_to_json(&status)),
        Err(error) => json_response(
            500,
            &format!(r#"{{"error":"{}"}}"#, escape_json(&error.to_string())),
        ),
    }
}

fn handle_commit_files_request(target: &str, commit_files_reader: &dyn CommitFilesReader) -> String {
    let Some(path) = extract_repo_path(target) else {
        return json_response(400, r#"{"error":"Missing repoPath query parameter."}"#);
    };

    let Some(commit_id) = extract_query_param(target, "commitId") else {
        return json_response(400, r#"{"error":"Missing commitId query parameter."}"#);
    };

    match read_commit_files(commit_files_reader, &path, &commit_id) {
        Ok(files) => json_response(200, &format!(r#"{{"files":[{}]}}"#, file_changes_to_json(&files))),
        Err(error) => json_response(
            500,
            &format!(r#"{{"error":"{}"}}"#, escape_json(&error.to_string())),
        ),
    }
}

fn handle_file_diff_request(target: &str, file_diff_reader: &dyn FileDiffReader) -> String {
    let Some(path) = extract_repo_path(target) else {
        return json_response(400, r#"{"error":"Missing repoPath query parameter."}"#);
    };

    let Some(commit_id) = extract_query_param(target, "commitId") else {
        return json_response(400, r#"{"error":"Missing commitId query parameter."}"#);
    };

    let Some(file_path) = extract_query_param(target, "path") else {
        return json_response(400, r#"{"error":"Missing path query parameter."}"#);
    };

    match read_file_diff(file_diff_reader, &path, &commit_id, &file_path) {
        Ok(diff) => json_response(200, &format!(r#"{{"diff":"{}"}}"#, escape_json(&diff))),
        Err(error) => json_response(
            500,
            &format!(r#"{{"error":"{}"}}"#, escape_json(&error.to_string())),
        ),
    }
}

fn handle_stash_request(target: &str, stash_reader: &dyn StashReader) -> String {
    let Some(path) = extract_repo_path(target) else {
        return json_response(400, r#"{"error":"Missing repoPath query parameter."}"#);
    };

    match read_stash(stash_reader, &path) {
        Ok(entries) => json_response(200, &format!(r#"{{"entries":[{}]}}"#, stash_entries_to_json(&entries))),
        Err(error) => json_response(
            500,
            &format!(r#"{{"error":"{}"}}"#, escape_json(&error.to_string())),
        ),
    }
}

fn extract_repo_path(target: &str) -> Option<PathBuf> {
    extract_query_param(target, "repoPath").map(PathBuf::from)
}

fn extract_query_param(target: &str, key: &str) -> Option<String> {
    let query = target.split('?').nth(1)?;
    let prefix = format!("{key}=");

    query
        .split('&')
        .find_map(|part| part.strip_prefix(prefix.as_str()))
        .map(percent_decode)
}

fn branches_to_json(branches: &[Branch]) -> String {
    let body = branches
        .iter()
        .map(|branch| {
            format!(
                concat!(
                    "{{",
                    r#""name":"{}","#,
                    r#""fullRef":"{}","#,
                    r#""isRemote":{},"#,
                    r#""isCurrent":{},"#,
                    r#""targetCommit":"{}""#,
                    "}}"
                ),
                escape_json(&branch.name),
                escape_json(&branch.full_ref),
                branch.is_remote,
                branch.is_current,
                escape_json(&branch.target_commit),
            )
        })
        .collect::<Vec<_>>()
        .join(",");

    format!(r#"{{"branches":[{body}]}}"#)
}

fn commits_to_json(commits: &[Commit]) -> String {
    let body = commits
        .iter()
        .map(|commit| {
            let parents = commit
                .parents
                .iter()
                .map(|parent| format!(r#""{}""#, escape_json(parent)))
                .collect::<Vec<_>>()
                .join(",");

            let refs = commit
                .refs
                .iter()
                .map(|reference| format!(r#""{}""#, escape_json(reference)))
                .collect::<Vec<_>>()
                .join(",");

            format!(
                concat!(
                    "{{",
                    r#""id":"{}","#,
                    r#""parents":[{}],"#,
                    r#""refs":[{}],"#,
                    r#""authorName":"{}","#,
                    r#""authorEmail":"{}","#,
                    r#""authoredAt":"{}","#,
                    r#""message":"{}""#,
                    "}}"
                ),
                escape_json(&commit.id),
                parents,
                refs,
                escape_json(&commit.author_name),
                escape_json(&commit.author_email),
                escape_json(&commit.authored_at),
                escape_json(&commit.message),
            )
        })
        .collect::<Vec<_>>()
        .join(",");

    format!(r#"{{"commits":[{body}]}}"#)
}

fn status_to_json(status: &WorkingStatus) -> String {
    format!(
        concat!(
            "{{",
            r#""isDirty":{},"#,
            r#""headCommitId":"{}","#,
            r#""changedFiles":[{}]"#,
            "}}"
        ),
        status.is_dirty,
        escape_json(&status.head_commit_id),
        file_changes_to_json(&status.changed_files),
    )
}

fn file_changes_to_json(files: &[FileChange]) -> String {
    files
        .iter()
        .map(|file| {
            format!(
                r#"{{"path":"{}","changeType":"{}"}}"#,
                escape_json(&file.path),
                file_change_type_to_json(file.change_type),
            )
        })
        .collect::<Vec<_>>()
        .join(",")
}

fn file_change_type_to_json(change_type: FileChangeType) -> &'static str {
    match change_type {
        FileChangeType::Added => "added",
        FileChangeType::Modified => "modified",
        FileChangeType::Deleted => "deleted",
        FileChangeType::Renamed => "renamed",
        FileChangeType::Untracked => "untracked",
    }
}

fn stash_entries_to_json(entries: &[StashEntry]) -> String {
    entries
        .iter()
        .map(|entry| {
            format!(
                concat!(
                    "{{",
                    r#""reference":"{}","#,
                    r#""index":{},"#,
                    r#""commitId":"{}","#,
                    r#""shortCommitId":"{}","#,
                    r#""baseCommitId":"{}","#,
                    r#""createdAt":"{}","#,
                    r#""message":"{}""#,
                    "}}"
                ),
                escape_json(&entry.reference),
                entry.index,
                escape_json(&entry.commit_id),
                escape_json(&entry.short_commit_id),
                escape_json(&entry.base_commit_id),
                escape_json(&entry.created_at),
                escape_json(&entry.message),
            )
        })
        .collect::<Vec<_>>()
        .join(",")
}

fn json_response(status_code: u16, body: &str) -> String {
    let status_text = match status_code {
        200 => "OK",
        400 => "Bad Request",
        404 => "Not Found",
        405 => "Method Not Allowed",
        _ => "Internal Server Error",
    };

    format!(
        concat!(
            "HTTP/1.1 {} {}\r\n",
            "Content-Type: application/json\r\n",
            "Access-Control-Allow-Origin: *\r\n",
            "Content-Length: {}\r\n",
            "Connection: close\r\n\r\n",
            "{}"
        ),
        status_code,
        status_text,
        body.len(),
        body
    )
}

fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut result = String::with_capacity(input.len());
    let mut index = 0;

    while index < bytes.len() {
        match bytes[index] {
            b'%' if index + 2 < bytes.len() => {
                let hex = &input[index + 1..index + 3];
                if let Ok(value) = u8::from_str_radix(hex, 16) {
                    result.push(value as char);
                    index += 3;
                    continue;
                }
                result.push('%');
            }
            b'+' => result.push(' '),
            value => result.push(value as char),
        }

        index += 1;
    }

    result
}

fn escape_json(input: &str) -> String {
    input
        .replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', "\\n")
}
