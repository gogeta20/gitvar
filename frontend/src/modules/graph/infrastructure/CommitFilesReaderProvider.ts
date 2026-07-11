import { CommitFilesReader } from "@modules/graph/application/contracts/CommitFilesReader";
import { readCommitFilesFromApi } from "@modules/graph/infrastructure/sources/readCommitFiles.api";

export function createCommitFilesReader(): CommitFilesReader {
  return {
    readCommitFiles: readCommitFilesFromApi
  };
}
