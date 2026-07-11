import { FileChange } from "@modules/graph/domain/fileChange";

export interface CommitFilesReader {
  readCommitFiles(repositoryPath: string, commitId: string): Promise<FileChange[]>;
}
