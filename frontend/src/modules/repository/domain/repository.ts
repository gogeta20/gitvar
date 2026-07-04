export interface RepositorySummary {
  id: string;
  name: string;
  path: string;
  currentBranch: string;
  status: "clean" | "modified";
  ahead: number;
  behind: number;
}

export interface BranchSummary {
  name: string;
  kind: "main" | "feature" | "release" | "hotfix";
  isActive: boolean;
}

export interface CommitNode {
  id: string;
  shortId: string;
  message: string;
  author: string;
  email: string;
  dateLabel: string;
  branch: string;
  lane: number;
  refs: string[];
  filesChanged: number;
  additions: number;
  deletions: number;
}

export interface RepositoryWorkspace {
  repositories: RepositorySummary[];
  branches: BranchSummary[];
  commits: CommitNode[];
  selectedRepositoryId: string;
  selectedCommitId: string;
}

