use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum AppError {
    GitCommandFailed(String),
    IoError(String),
    ParseError(String),
    PersistenceError(String),
}

impl Display for AppError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::GitCommandFailed(message) => write!(f, "Git command failed: {message}"),
            Self::IoError(message) => write!(f, "IO error: {message}"),
            Self::ParseError(message) => write!(f, "Parse error: {message}"),
            Self::PersistenceError(message) => write!(f, "Persistence error: {message}"),
        }
    }
}

impl std::error::Error for AppError {}
