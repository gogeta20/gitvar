import { Commit } from "@modules/graph/domain/commit";

interface CommitDto {
  id: string;
  parents: string[];
  refs: string[];
  authorName: string;
  authorEmail: string;
  authoredAt: string;
  message: string;
}

interface CommitResponseDto {
  commits: CommitDto[];
}

export function parseCommitsDto(input: CommitResponseDto): Commit[] {
  return input.commits.map((commit) => ({
    id: commit.id,
    parents: commit.parents,
    refs: commit.refs,
    authorName: commit.authorName,
    authorEmail: commit.authorEmail,
    authoredAt: commit.authoredAt,
    message: commit.message
  }));
}
