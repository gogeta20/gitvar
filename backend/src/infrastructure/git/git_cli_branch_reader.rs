use std::path::Path;
use std::path::PathBuf;
use std::process::Command;
use rusqlite::{params, Connection};

use crate::app::branches::contracts::BranchReader;
use crate::domain::branch::Branch;
use crate::domain::errors::AppError;
use crate::infrastructure::git::parse_branch_refs::parse_branch_refs;

pub struct GitCliBranchReader {
    metadata_db_path: PathBuf,
}

impl GitCliBranchReader {
    pub fn new() -> Self {
        Self {
            metadata_db_path: resolve_metadata_db_path(),
        }
    }
}

impl BranchReader for GitCliBranchReader {
    fn read_branches(&self, repository_path: &Path) -> Result<Vec<Branch>, AppError> {
        let output = Command::new("git")
            .args([
                "for-each-ref",
                "refs/heads",
                "refs/remotes",
                "--format=%(refname)|%(refname:short)|%(if)%(HEAD)%(then)true%(else)false%(end)|%(objectname)",
            ])
            .current_dir(repository_path)
            .output()
            .map_err(|error| AppError::IoError(error.to_string()))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            return Err(AppError::GitCommandFailed(stderr));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let mut branches = parse_branch_refs(&stdout)?;
        let connection = open_metadata_connection(&self.metadata_db_path)?;

        for branch in &mut branches {
            if branch.is_remote {
                continue;
            }

            branch.created_at = Some(resolve_branch_created_at(
                &connection,
                repository_path,
                branch,
            )?);
        }

        Ok(branches)
    }
}

fn resolve_metadata_db_path() -> PathBuf {
    if let Ok(value) = std::env::var("GITMAP_DB_PATH") {
        return PathBuf::from(value);
    }

    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("backend directory should have a parent")
        .join("db")
        .join("gitmap.sqlite")
}

fn open_metadata_connection(database_path: &Path) -> Result<Connection, AppError> {
    if let Some(parent) = database_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|error| AppError::IoError(error.to_string()))?;
    }

    let connection = Connection::open(database_path)
        .map_err(|error| AppError::PersistenceError(error.to_string()))?;

    connection
        .execute(
            "CREATE TABLE IF NOT EXISTS local_branch_metadata (
                repository_path TEXT NOT NULL,
                full_ref TEXT NOT NULL,
                branch_name TEXT NOT NULL,
                created_at TEXT NOT NULL,
                source TEXT NOT NULL,
                PRIMARY KEY (repository_path, full_ref)
            )",
            [],
        )
        .map_err(|error| AppError::PersistenceError(error.to_string()))?;

    Ok(connection)
}

fn resolve_branch_created_at(
    connection: &Connection,
    repository_path: &Path,
    branch: &Branch,
) -> Result<String, AppError> {
    let repository_path_key = repository_path.to_string_lossy().to_string();

    let mut statement = connection
        .prepare(
            "SELECT created_at
             FROM local_branch_metadata
             WHERE repository_path = ?1 AND full_ref = ?2",
        )
        .map_err(|error| AppError::PersistenceError(error.to_string()))?;

    let existing = statement.query_row(
        params![repository_path_key, branch.full_ref],
        |row| row.get::<_, String>(0),
    );

    match existing {
        Ok(value) => Ok(value),
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            let reflog_created_at =
                read_branch_created_at_from_reflog(repository_path, &branch.name)?;
            let (created_at, source) = match reflog_created_at {
                Some(value) => (value, "reflog"),
                None => (sqlite_now_timestamp(connection)?, "first_seen"),
            };

            connection
                .execute(
                    "INSERT INTO local_branch_metadata (
                        repository_path,
                        full_ref,
                        branch_name,
                        created_at,
                        source
                    ) VALUES (?1, ?2, ?3, ?4, ?5)",
                    params![
                        repository_path.to_string_lossy().to_string(),
                        branch.full_ref,
                        branch.name,
                        created_at,
                        source
                    ],
                )
                .map_err(|error| AppError::PersistenceError(error.to_string()))?;

            Ok(created_at)
        }
        Err(error) => Err(AppError::PersistenceError(error.to_string())),
    }
}

fn read_branch_created_at_from_reflog(
    repository_path: &Path,
    branch_name: &str,
) -> Result<Option<String>, AppError> {
    let output = Command::new("git")
        .args([
            "reflog",
            "show",
            "--date=iso-strict",
            "--format=%gs%x1f%cd",
            branch_name,
        ])
        .current_dir(repository_path)
        .output()
        .map_err(|error| AppError::IoError(error.to_string()))?;

    if !output.status.success() {
        return Ok(None);
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    let created_at = stdout
        .lines()
        .rev()
        .find_map(|line| {
            let (message, timestamp) = line.split_once('\u{1f}')?;
            if message.starts_with("branch: Created") {
                Some(timestamp.to_string())
            } else {
                None
            }
        });

    Ok(created_at)
}

fn sqlite_now_timestamp(connection: &Connection) -> Result<String, AppError> {
    connection
        .query_row("SELECT strftime('%Y-%m-%dT%H:%M:%SZ', 'now')", [], |row| {
            row.get::<_, String>(0)
        })
        .map_err(|error| AppError::PersistenceError(error.to_string()))
}
