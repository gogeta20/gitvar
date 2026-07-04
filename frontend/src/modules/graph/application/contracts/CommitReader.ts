import { Commit } from "@modules/graph/domain/commit";

export interface CommitReader {
  readCommits(repositoryPath: string): Promise<Commit[]>;
}
