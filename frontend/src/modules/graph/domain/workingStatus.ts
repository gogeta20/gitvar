export interface WorkingStatus {
  isDirty: boolean;
  headCommitId: string;
}

export const WORKING_CHANGES_COMMIT_ID = "__working-changes__";
