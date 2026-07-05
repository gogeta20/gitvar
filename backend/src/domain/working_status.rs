#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WorkingStatus {
    pub is_dirty: bool,
    pub head_commit_id: String,
}
