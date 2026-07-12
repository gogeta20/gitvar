export interface StashEntry {
  reference: string;
  index: number;
  commitId: string;
  shortCommitId: string;
  baseCommitId: string;
  relativeDate: string;
  message: string;
}
