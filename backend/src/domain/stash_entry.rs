#[derive(Debug, Clone, PartialEq, Eq)]
pub struct StashEntry {
    pub reference: String,
    pub index: u32,
    pub commit_id: String,
    pub short_commit_id: String,
    pub base_commit_id: String,
    pub relative_date: String,
    pub message: String,
}
