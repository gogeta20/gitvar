import { CommitReader } from "@modules/graph/application/contracts/CommitReader";
import { readCommitsFromApi } from "@modules/graph/infrastructure/sources/readCommits.api";

export function createCommitReader(): CommitReader {
  return {
    readCommits: readCommitsFromApi
  };
}
