import {
  BranchSummary,
  CommitNode,
  RepositorySummary,
  RepositoryWorkspace
} from "@modules/repository/domain/repository";

interface RepositorySummaryDto extends RepositorySummary {}
interface BranchSummaryDto extends BranchSummary {}
interface CommitNodeDto extends CommitNode {}

interface RepositoryWorkspaceDto {
  repositories: RepositorySummaryDto[];
  branches: BranchSummaryDto[];
  commits: CommitNodeDto[];
  selectedRepositoryId: string;
  selectedCommitId: string;
}

export function parseRepositoryWorkspaceDto(
  input: RepositoryWorkspaceDto
): RepositoryWorkspace {
  return {
    repositories: input.repositories,
    branches: input.branches,
    commits: input.commits,
    selectedRepositoryId: input.selectedRepositoryId,
    selectedCommitId: input.selectedCommitId
  };
}

