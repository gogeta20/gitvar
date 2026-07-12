export interface DirectoryEntry {
  name: string;
  path: string;
  isGitRepo: boolean;
}

export interface DirectoryListing {
  currentPath: string;
  parentPath: string | null;
  entries: DirectoryEntry[];
}
