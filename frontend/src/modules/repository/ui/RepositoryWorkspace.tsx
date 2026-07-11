import { BranchesPanel } from "@modules/branches/ui/BranchesPanel";
import { Branch } from "@modules/branches/domain/branch";
import { CommitDetailPanel } from "@modules/graph/ui/CommitDetailPanel";
import { CommitGraphPanel } from "@modules/graph/ui/CommitGraphPanel";
import { FileDiffPanel } from "@modules/graph/ui/FileDiffPanel";
import { GraphCommit } from "@modules/graph/domain/commit";
import { WORKING_CHANGES_COMMIT_ID } from "@modules/graph/domain/workingStatus";
import { useEffect, useMemo, useState } from "react";
import { InfoCard } from "@core/components/InfoCard";
import { ResizeHandle } from "@core/components/ResizeHandle";
import { useResizableWidth } from "@core/hooks/useResizableWidth";
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
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBranchesOpen, setIsBranchesOpen] = useState(true);
  const [isStashOpen, setIsStashOpen] = useState(false);
  const detailPanelWidth = useResizableWidth({
    storageKey: "gitmap.detailPanelWidth",
    defaultWidth: 320,
    minWidth: 260,
    maxWidth: 640,
    panelPosition: "end"
  });
  const sidebarWidth = useResizableWidth({
    storageKey: "gitmap.sidebarWidth",
    defaultWidth: 260,
    minWidth: 200,
    maxWidth: 480,
    panelPosition: "start"
  });

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

  useEffect(() => {
    setSelectedBranch(null);
    setSelectedCommitId(null);
    setSelectedFilePath(null);
  }, [selectedRepositoryId]);

  useEffect(() => {
    setSelectedFilePath(null);
  }, [selectedCommitId]);

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

  function handleSelectBranch(branch: Branch) {
    setSelectedBranch(branch);
    setSelectedCommitId(branch.targetCommit);
  }

  function handleViewChanges() {
    setSelectedFilePath(null);
    setSelectedCommitId(WORKING_CHANGES_COMMIT_ID);
  }

  return (
    <section
      className={
        isSidebarOpen
          ? styles.workspace
          : `${styles.workspace} ${styles.workspaceSidebarCollapsed}`
      }
    >
      <aside
        className={
          isSidebarOpen
            ? styles.sidebar
            : `${styles.sidebar} ${styles.sidebarCollapsed}`
        }
        style={isSidebarOpen ? { width: sidebarWidth.width } : undefined}
      >
        {!isSidebarOpen ? (
          <button
            className={styles.sidebarCollapsedToggle}
            onClick={() => setIsSidebarOpen(true)}
            type="button"
          >
            <span className={styles.sidebarIconBadge}>{">"}</span>
          </button>
        ) : null}

        {isSidebarOpen ? (
          <div className={styles.sidebarPanels}>
            <section className={styles.sidebarSection}>
              <div className={styles.sidebarSectionHeader}>
                <div className={styles.sidebarSectionTitleRow}>
                  <button
                    className={styles.sidebarInlineCollapse}
                    onClick={() => setIsSidebarOpen(false)}
                    type="button"
                  >
                    <span className={styles.sidebarIconBadge}>{"<"}</span>
                  </button>
                  <button
                    className={styles.sidebarSectionTitleButton}
                    onClick={() => setIsBranchesOpen((current) => !current)}
                    type="button"
                  >
                    <strong>Branches</strong>
                  </button>
                </div>
              </div>

              {isBranchesOpen ? (
                <div className={styles.sidebarSectionBody}>
                  <BranchesPanel
                    embedded
                    onSelectBranch={handleSelectBranch}
                    repositoryPath={selectedRepository.path}
                    selectedBranchName={selectedBranch?.name ?? null}
                  />
                </div>
              ) : null}
            </section>

            <section className={styles.sidebarSection}>
              <div className={styles.sidebarSectionHeader}>
                <div className={styles.sidebarSectionTitleRow}>
                  <button
                    className={styles.sidebarSectionTitleButton}
                    onClick={() => setIsStashOpen((current) => !current)}
                    type="button"
                  >
                    <strong>Stash</strong>
                  </button>
                </div>
              </div>

              {isStashOpen ? (
                <div className={styles.sidebarSectionBody}>
                  <div className={styles.mockList}>
                    <button className={styles.mockItem} type="button">
                      <span className={styles.mockItemTitle}>stash@&#123;0&#125;</span>
                      <span className={styles.mockItemMeta}>WIP graph polish</span>
                    </button>
                    <button className={styles.mockItem} type="button">
                      <span className={styles.mockItemTitle}>stash@&#123;1&#125;</span>
                      <span className={styles.mockItemMeta}>Explore sidebar toggle</span>
                    </button>
                    <button className={styles.mockItem} type="button">
                      <span className={styles.mockItemTitle}>stash@&#123;2&#125;</span>
                      <span className={styles.mockItemMeta}>Theme probe mock</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}
      </aside>

      {isSidebarOpen ? (
        <ResizeHandle
          className={styles.sidebarResizeHandle}
          label="Resize sidebar"
          onPointerDown={sidebarWidth.startDragging}
        />
      ) : null}

      <div className={styles.historyColumn}>
        {selectedFilePath && selectedCommit ? (
          <FileDiffPanel
            commitId={selectedCommit.id}
            filePath={selectedFilePath}
            onClose={() => setSelectedFilePath(null)}
            repositoryPath={selectedRepository.path}
          />
        ) : (
          <CommitGraphPanel
            onCommitsLoaded={setGraphCommits}
            onSelectCommit={setSelectedCommitId}
            repositoryPath={selectedRepository.path}
            selectedBranchName={selectedBranch?.name ?? null}
            selectedBranchTargetCommit={selectedBranch?.targetCommit ?? null}
            selectedCommitId={selectedCommitId}
          />
        )}
      </div>

      <ResizeHandle
        className={styles.detailResizeHandle}
        label="Resize commit detail panel"
        onPointerDown={detailPanelWidth.startDragging}
      />

      <aside className={styles.detailColumn} style={{ width: detailPanelWidth.width }}>
        <CommitDetailPanel
          commit={selectedCommit}
          onSelectFile={setSelectedFilePath}
          onViewChanges={handleViewChanges}
          repositoryPath={selectedRepository.path}
          selectedFilePath={selectedFilePath}
        />
      </aside>
    </section>
  );
}
