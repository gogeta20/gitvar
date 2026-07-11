use crate::domain::file_change::FileChange;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WorkingStatus {
    pub is_dirty: bool,
    pub head_commit_id: String,
    pub changed_files: Vec<FileChange>,
}
