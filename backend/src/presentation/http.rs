use std::io::{Read, Write};
use std::net::TcpListener;
use std::path::PathBuf;

use crate::app::branches::contracts::BranchReader;
use crate::app::branches::read_branches::read_branches;
use crate::domain::branch::Branch;
use crate::domain::errors::AppError;

pub fn serve(branch_reader: &dyn BranchReader) -> Result<(), AppError> {
    let listener = TcpListener::bind("127.0.0.1:7878")
        .map_err(|error| AppError::IoError(error.to_string()))?;

    println!("GitMap backend listening on http://127.0.0.1:7878");

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
        let response = route_request(&request, branch_reader);

        stream
            .write_all(response.as_bytes())
            .map_err(|error| AppError::IoError(error.to_string()))?;
    }

    Ok(())
}

fn route_request(request: &str, branch_reader: &dyn BranchReader) -> String {
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

    json_response(404, r#"{"error":"Not found."}"#)
}

fn handle_branch_request(target: &str, branch_reader: &dyn BranchReader) -> String {
    let Some(query) = target.split('?').nth(1) else {
        return json_response(400, r#"{"error":"Missing repoPath query parameter."}"#);
    };

    let repo_path = query
        .split('&')
        .find_map(|part| part.strip_prefix("repoPath="))
        .map(percent_decode);

    let Some(repo_path) = repo_path else {
        return json_response(400, r#"{"error":"Missing repoPath query parameter."}"#);
    };

    let path = PathBuf::from(repo_path);

    match read_branches(branch_reader, &path) {
        Ok(branches) => json_response(200, &branches_to_json(&branches)),
        Err(error) => json_response(
            500,
            &format!(r#"{{"error":"{}"}}"#, escape_json(&error.to_string())),
        ),
    }
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
                    r#""targetCommit":"{}""#,
                    "}}"
                ),
                escape_json(&branch.name),
                escape_json(&branch.full_ref),
                branch.is_remote,
                escape_json(&branch.target_commit),
            )
        })
        .collect::<Vec<_>>()
        .join(",");

    format!(r#"{{"branches":[{body}]}}"#)
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
