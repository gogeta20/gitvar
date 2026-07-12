export interface StashEntry {
  reference: string;
  index: number;
  commitId: string;
  shortCommitId: string;
  baseCommitId: string;
  createdAt: string;
  message: string;
}
