import { FileChange } from "@modules/graph/domain/fileChange";

export interface WorkingStatus {
  isDirty: boolean;
  headCommitId: string;
  changedFiles: FileChange[];
}

export const WORKING_CHANGES_COMMIT_ID = "__working-changes__";
