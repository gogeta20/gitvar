import { RepositoryWorkspace } from "@modules/repository/domain/repository";
import { parseRepositoryWorkspaceDto } from "@modules/repository/infrastructure/parsers/parseRepositoryWorkspaceDto";

export async function loadRepositoryWorkspaceFromMock(): Promise<RepositoryWorkspace> {
  return parseRepositoryWorkspaceDto({
    repositories: [
      {
        id: "repo-1",
        name: "gitmap",
        path: "/home/mau/projects/personal/gipmap",
        currentBranch: "feature/real-commit-graph",
        status: "modified",
        ahead: 3,
        behind: 0
      },
      {
        id: "repo-2",
        name: "skeleton-react",
        path: "~/projects/labs/skeleton-react",
        currentBranch: "main",
        status: "clean",
        ahead: 0,
        behind: 0
      },
      {
        id: "repo-3",
        name: "notes-engine",
        path: "~/projects/tools/notes-engine",
        currentBranch: "release/0.3.0",
        status: "modified",
        ahead: 1,
        behind: 2
      }
    ],
    branches: [
      {
        name: "feature/real-commit-graph",
        kind: "feature",
        isActive: true
      },
      {
        name: "feature/real-branches-panel",
        kind: "feature",
        isActive: false
      },
      {
        name: "main",
        kind: "main",
        isActive: false
      },
      {
        name: "release/0.1.0",
        kind: "release",
        isActive: false
      },
      {
        name: "hotfix/theme-flicker",
        kind: "hotfix",
        isActive: false
      }
    ],
    commits: [
      {
        id: "7f89cd102a",
        shortId: "7f89cd1",
        message: "Create frontend scaffold with use-case driven data flow",
        author: "Mau",
        email: "mau@example.dev",
        dateLabel: "Today · 18:42",
        branch: "feature/real-commit-graph",
        lane: 0,
        refs: ["HEAD", "feature/real-commit-graph"],
        filesChanged: 18,
        additions: 544,
        deletions: 0
      },
      {
        id: "f10ac77041",
        shortId: "f10ac77",
        message: "Refactor styles into tokens and CSS modules",
        author: "Mau",
        email: "mau@example.dev",
        dateLabel: "Today · 18:16",
        branch: "feature/frontend-foundation",
        lane: 0,
        refs: [],
        filesChanged: 9,
        additions: 143,
        deletions: 51
      },
      {
        id: "a4bb720ca9",
        shortId: "a4bb720",
        message: "Add base documentation, plan and session tracking",
        author: "Mau",
        email: "mau@example.dev",
        dateLabel: "Today · 17:58",
        branch: "main",
        lane: 1,
        refs: ["main"],
        filesChanged: 5,
        additions: 92,
        deletions: 0
      },
      {
        id: "0d11bf8be4",
        shortId: "0d11bf8",
        message: "Sketch Docker dev environment and root structure",
        author: "Mau",
        email: "mau@example.dev",
        dateLabel: "Today · 17:41",
        branch: "release/0.1.0",
        lane: 2,
        refs: ["release/0.1.0"],
        filesChanged: 7,
        additions: 116,
        deletions: 0
      },
      {
        id: "778bcd84de",
        shortId: "778bcd8",
        message: "Prototype graph lanes and commit detail panel copy",
        author: "Mau",
        email: "mau@example.dev",
        dateLabel: "Yesterday · 23:07",
        branch: "hotfix/theme-flicker",
        lane: 3,
        refs: ["hotfix/theme-flicker"],
        filesChanged: 4,
        additions: 61,
        deletions: 14
      }
    ],
    selectedRepositoryId: "repo-1",
    selectedCommitId: "7f89cd102a"
  });
}
