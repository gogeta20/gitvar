export type FileChangeType = "added" | "modified" | "deleted" | "renamed" | "untracked";

export interface FileChange {
  path: string;
  changeType: FileChangeType;
  isStaged: boolean;
}
