import { CommitReader } from "@modules/graph/application/contracts/CommitReader";
import { Commit } from "@modules/graph/domain/commit";

export async function readCommits(
  commitReader: CommitReader,
  repositoryPath: string
): Promise<Commit[]> {
  return commitReader.readCommits(repositoryPath);
}
