import { useEffect, useMemo, useState } from "react";
import { InfoCard } from "@core/components/InfoCard";
import { loadRepositoryWorkspace } from "@modules/repository/application/use-cases/loadRepositoryWorkspace";
import {
  CommitNode,
  RepositorySummary,
  RepositoryWorkspace as RepositoryWorkspaceState
} from "@modules/repository/domain/repository";
import { createRepositoryReader } from "@modules/repository/infrastructure/RepositoryReaderProvider";
import styles from "./RepositoryWorkspace.module.css";

interface RepositoryWorkspaceProps {
  initialRepositoryId?: string;
}

export function RepositoryWorkspace({
  initialRepositoryId
}: RepositoryWorkspaceProps) {
  const [workspace, setWorkspace] = useState<RepositoryWorkspaceState | null>(null);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string | null>(null);
  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const repositoryReader = createRepositoryReader();

    loadRepositoryWorkspace(repositoryReader)
      .then((nextWorkspace) => {
        setWorkspace(nextWorkspace);
        setSelectedRepositoryId(
          initialRepositoryId ?? nextWorkspace.selectedRepositoryId
        );
        setSelectedCommitId(nextWorkspace.selectedCommitId);
      })
      .catch((currentError: unknown) => {
        setError(
          currentError instanceof Error ? currentError.message : "Unexpected error."
        );
      });
  }, [initialRepositoryId]);

  const selectedRepository = useMemo<RepositorySummary | null>(() => {
    if (!workspace || !selectedRepositoryId) {
      return null;
    }

    return (
      workspace.repositories.find((item) => item.id === selectedRepositoryId) ?? null
    );
  }, [workspace, selectedRepositoryId]);

  const selectedCommit = useMemo<CommitNode | null>(() => {
    if (!workspace || !selectedCommitId) {
      return null;
    }

    return workspace.commits.find((item) => item.id === selectedCommitId) ?? null;
  }, [workspace, selectedCommitId]);

  if (error) {
    return <InfoCard title="Repository workspace">{error}</InfoCard>;
  }

  if (!workspace || !selectedRepository || !selectedCommit) {
    return <InfoCard title="Repository workspace">Loading workspace...</InfoCard>;
  }

  return (
    <section className={styles.workspace}>
      <aside className={styles.sidebar}>
        <InfoCard title="Repositories">
          <div className={styles.repositoryList}>
            {workspace.repositories.map((repository) => {
              const isSelected = repository.id === selectedRepository.id;

              return (
                <button
                  key={repository.id}
                  className={isSelected ? styles.repositoryButtonActive : styles.repositoryButton}
                  onClick={() => setSelectedRepositoryId(repository.id)}
                  type="button"
                >
                  <div className={styles.repositoryTopline}>
                    <strong>{repository.name}</strong>
                    <span>{repository.status}</span>
                  </div>
                  <p>{repository.path}</p>
                  <div className={styles.repositoryMeta}>
                    <span>{repository.currentBranch}</span>
                    <span>
                      ↑{repository.ahead} ↓{repository.behind}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </InfoCard>

        <InfoCard title="Branches">
          <div className={styles.branchList}>
            {workspace.branches.map((branch) => (
              <div key={branch.name} className={styles.branchItem}>
                <span className={branch.isActive ? styles.branchBadgeActive : styles.branchBadge}>
                  {branch.kind}
                </span>
                <span>{branch.name}</span>
              </div>
            ))}
          </div>
        </InfoCard>
      </aside>

      <div className={styles.historyColumn}>
        <InfoCard title="History map">
          <div className={styles.historyHeader}>
            <div>
              <p className={styles.historyLabel}>Focused repository</p>
              <h2 className={styles.historyTitle}>{selectedRepository.name}</h2>
            </div>
            <div className={styles.historyStats}>
              <span>{workspace.commits.length} commits</span>
              <span>{workspace.branches.length} branches</span>
            </div>
          </div>

          <div className={styles.commitList}>
            {workspace.commits.map((commit) => {
              const isSelected = commit.id === selectedCommit.id;

              return (
                <button
                  key={commit.id}
                  className={isSelected ? styles.commitRowActive : styles.commitRow}
                  onClick={() => setSelectedCommitId(commit.id)}
                  type="button"
                >
                  <div className={styles.graphLane} data-lane={commit.lane}>
                    <span className={styles.graphDot} />
                    <span className={styles.graphLine} />
                  </div>

                  <div className={styles.commitBody}>
                    <div className={styles.commitTopline}>
                      <strong>{commit.message}</strong>
                      <span>{commit.dateLabel}</span>
                    </div>
                    <div className={styles.commitMeta}>
                      <span>
                        {commit.shortId} · {commit.author}
                      </span>
                      <div className={styles.refList}>
                        {commit.refs.map((ref) => (
                          <span key={ref} className={styles.refTag}>
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </InfoCard>
      </div>

      <aside className={styles.detailColumn}>
        <InfoCard title="Commit detail">
          <div className={styles.detailHeader}>
            <span className={styles.detailCommitId}>{selectedCommit.shortId}</span>
            <span className={styles.detailBranch}>{selectedCommit.branch}</span>
          </div>
          <h3 className={styles.detailTitle}>{selectedCommit.message}</h3>
          <div className={styles.detailGrid}>
            <div>
              <span className={styles.detailLabel}>Author</span>
              <p>{selectedCommit.author}</p>
            </div>
            <div>
              <span className={styles.detailLabel}>Email</span>
              <p>{selectedCommit.email}</p>
            </div>
            <div>
              <span className={styles.detailLabel}>Files</span>
              <p>{selectedCommit.filesChanged}</p>
            </div>
            <div>
              <span className={styles.detailLabel}>Changes</span>
              <p>
                +{selectedCommit.additions} / -{selectedCommit.deletions}
              </p>
            </div>
          </div>
        </InfoCard>

        <InfoCard title="Operation preview">
          <p className={styles.previewCopy}>
            Future actions like merge, rebase and reset should explain their impact here
            before touching the repository.
          </p>
          <ul className={styles.previewList}>
            <li>Show branch movement before execution.</li>
            <li>Estimate commits rewritten or dropped.</li>
            <li>Store a local undo log for risky operations.</li>
          </ul>
        </InfoCard>
      </aside>
    </section>
  );
}
