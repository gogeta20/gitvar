import { CommitFilesReader } from "@modules/graph/application/contracts/CommitFilesReader";
import { FileChange } from "@modules/graph/domain/fileChange";

export async function readCommitFiles(
  commitFilesReader: CommitFilesReader,
  repositoryPath: string,
  commitId: string
): Promise<FileChange[]> {
  return commitFilesReader.readCommitFiles(repositoryPath, commitId);
}
