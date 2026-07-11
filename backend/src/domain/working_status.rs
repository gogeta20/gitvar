use crate::domain::file_change::FileChange;

pub const WORKING_CHANGES_COMMIT_ID: &str = "__working-changes__";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WorkingStatus {
    pub is_dirty: bool,
    pub head_commit_id: String,
    pub changed_files: Vec<FileChange>,
}
