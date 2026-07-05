import { BranchesPanel } from "@modules/branches/ui/BranchesPanel";
import { CommitGraphPanel } from "@modules/graph/ui/CommitGraphPanel";
import { GraphCommit } from "@modules/graph/domain/commit";
import { useEffect, useMemo, useState } from "react";
import { InfoCard } from "@core/components/InfoCard";
import { loadRepositoryWorkspace } from "@modules/repository/application/use-cases/loadRepositoryWorkspace";
import {
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
  const [error, setError] = useState<string | null>(null);
  const [graphCommits, setGraphCommits] = useState<GraphCommit[]>([]);
  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null);

  useEffect(() => {
    const repositoryReader = createRepositoryReader();

    loadRepositoryWorkspace(repositoryReader)
      .then((nextWorkspace) => {
        setWorkspace(nextWorkspace);
        setSelectedRepositoryId(
          initialRepositoryId ?? nextWorkspace.selectedRepositoryId
        );
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

  const selectedCommit = useMemo(() => {
    if (!selectedCommitId) {
      return null;
    }

    return graphCommits.find((item) => item.id === selectedCommitId) ?? null;
  }, [graphCommits, selectedCommitId]);

  if (error) {
    return <InfoCard title="Repository workspace">{error}</InfoCard>;
  }

  if (!workspace || !selectedRepository) {
    return <InfoCard title="Repository workspace">Loading workspace...</InfoCard>;
  }

  return (
    <section className={styles.workspace}>
      <aside className={styles.sidebar}>
        <BranchesPanel repositoryPath={selectedRepository.path} />
      </aside>

      <div className={styles.historyColumn}>
        <div className={styles.historyIntro}>
          <div>
            <p className={styles.historyLabel}>Focused repository</p>
            <h2 className={styles.historyTitle}>{selectedRepository.name}</h2>
          </div>
          <div className={styles.historyStats}>
            <span>Real commit graph</span>
            <span>Mock details for now</span>
          </div>
        </div>

        <CommitGraphPanel
          onCommitsLoaded={setGraphCommits}
          onSelectCommit={setSelectedCommitId}
          repositoryPath={selectedRepository.path}
          selectedCommitId={selectedCommitId}
        />
      </div>

      <aside className={styles.detailColumn}>
        <InfoCard title="Commit detail">
          {selectedCommit ? (
            <>
              <div className={styles.detailHeader}>
                <span className={styles.detailCommitId}>{selectedCommit.shortId}</span>
                <span className={styles.detailBranch}>
                  {selectedCommit.refs[0] ?? "commit"}
                </span>
              </div>
              <h3 className={styles.detailTitle}>{selectedCommit.message}</h3>
              <div className={styles.detailGrid}>
                <div>
                  <span className={styles.detailLabel}>Author</span>
                  <p>{selectedCommit.authorName}</p>
                </div>
                <div>
                  <span className={styles.detailLabel}>Email</span>
                  <p>{selectedCommit.authorEmail}</p>
                </div>
                <div>
                  <span className={styles.detailLabel}>Parents</span>
                  <p>{selectedCommit.parents.length}</p>
                </div>
                <div>
                  <span className={styles.detailLabel}>Date</span>
                  <p>{selectedCommit.authoredAt}</p>
                </div>
              </div>
            </>
          ) : (
            <p className={styles.previewCopy}>
              Select a commit from the graph to inspect its details. The detail panel
              still uses mock metadata until the next backend slice.
            </p>
          )}
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
