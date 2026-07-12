#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DirectoryEntry {
    pub name: String,
    pub path: String,
    pub is_git_repo: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DirectoryListing {
    pub current_path: String,
    pub parent_path: Option<String>,
    pub entries: Vec<DirectoryEntry>,
}
