#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Branch {
    pub name: String,
    pub full_ref: String,
    pub is_remote: bool,
    pub target_commit: String,
}
