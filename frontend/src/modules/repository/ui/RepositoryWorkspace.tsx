import { BranchesPanel } from "@modules/branches/ui/BranchesPanel";
import { Branch } from "@modules/branches/domain/branch";
import { CommitDetailPanel } from "@modules/graph/ui/CommitDetailPanel";
import { CommitGraphPanel } from "@modules/graph/ui/CommitGraphPanel";
import { FileDiffPanel } from "@modules/graph/ui/FileDiffPanel";
import { GraphCommit } from "@modules/graph/domain/commit";
import { WORKING_CHANGES_COMMIT_ID } from "@modules/graph/domain/workingStatus";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ResizeHandle } from "@core/components/ResizeHandle";
import { useResizableWidth } from "@core/hooks/useResizableWidth";
import { RepositorySummary } from "@modules/repository/domain/repository";
import { useRepoLiveRefresh } from "@modules/repository/application/use-cases/useRepoLiveRefresh";
import { StashEntry } from "@modules/stash/domain/stashEntry";
import { StashPanel } from "@modules/stash/ui/StashPanel";
import styles from "./RepositoryWorkspace.module.css";

interface RepositoryWorkspaceProps {
  repository: RepositorySummary;
}

export function RepositoryWorkspace({ repository: selectedRepository }: RepositoryWorkspaceProps) {
  const refreshToken = useRepoLiveRefresh(selectedRepository.path);
  const [graphCommits, setGraphCommits] = useState<GraphCommit[]>([]);
  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(true);
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
    setSelectedBranch(null);
    setSelectedCommitId(null);
    setSelectedFilePath(null);
  }, [selectedRepository.id]);

  useEffect(() => {
    setSelectedFilePath(null);
  }, [selectedCommitId]);

  const selectedCommit = useMemo(() => {
    if (!selectedCommitId) {
      return null;
    }

    return graphCommits.find((item) => item.id === selectedCommitId) ?? null;
  }, [graphCommits, selectedCommitId]);

  function handleSelectBranch(branch: Branch) {
    setSelectedBranch(branch);
    setSelectedCommitId(branch.targetCommit);
  }

  function handleSelectStash(entry: StashEntry) {
    setSelectedBranch(null);
    setSelectedFilePath(null);
    setSelectedCommitId(entry.commitId);
  }

  function handleViewChanges() {
    setSelectedFilePath(null);
    setSelectedCommitId(WORKING_CHANGES_COMMIT_ID);
  }

  const gridTemplateColumns = [
    ...(isSidebarOpen ? ["auto", "10px"] : []),
    "minmax(0, 1fr)",
    ...(isDetailOpen ? ["10px", "auto"] : [])
  ].join(" ");

  return (
    <section className={styles.workspace} style={{ gridTemplateColumns }}>
      {isSidebarOpen ? (
        <aside className={styles.sidebar} style={{ width: sidebarWidth.width }}>
          <div className={styles.sidebarPanels}>
            <section className={styles.sidebarSection}>
              <div className={styles.sidebarSectionHeader}>
                <div className={styles.sidebarSectionTitleRow}>
                  <button
                    className={styles.sidebarSectionTitleButton}
                    onClick={() => setIsBranchesOpen((current) => !current)}
                    type="button"
                  >
                    <strong>Branches</strong>
                    {isBranchesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {isBranchesOpen ? (
                <div className={styles.sidebarSectionBody}>
                  <BranchesPanel
                    embedded
                    onSelectBranch={handleSelectBranch}
                    refreshToken={refreshToken}
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
                    {isStashOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {isStashOpen ? (
                <div className={styles.sidebarSectionBody}>
                  <StashPanel
                    embedded
                    onSelectStash={handleSelectStash}
                    refreshToken={refreshToken}
                    repositoryPath={selectedRepository.path}
                    selectedCommitId={selectedCommitId}
                  />
                </div>
              ) : null}
            </section>
          </div>
        </aside>
      ) : null}

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
            isDetailOpen={isDetailOpen}
            isSidebarOpen={isSidebarOpen}
            onClose={() => setSelectedFilePath(null)}
            onToggleDetail={() => setIsDetailOpen((current) => !current)}
            onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
            repositoryPath={selectedRepository.path}
          />
        ) : (
          <CommitGraphPanel
            isDetailOpen={isDetailOpen}
            isSidebarOpen={isSidebarOpen}
            onCommitsLoaded={setGraphCommits}
            onSelectCommit={setSelectedCommitId}
            onToggleDetail={() => setIsDetailOpen((current) => !current)}
            onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
            refreshToken={refreshToken}
            repositoryPath={selectedRepository.path}
            selectedBranchName={selectedBranch?.name ?? null}
            selectedBranchTargetCommit={selectedBranch?.targetCommit ?? null}
            selectedCommitId={selectedCommitId}
          />
        )}
      </div>

      {isDetailOpen ? (
        <ResizeHandle
          className={styles.detailResizeHandle}
          label="Resize commit detail panel"
          onPointerDown={detailPanelWidth.startDragging}
        />
      ) : null}

      {isDetailOpen ? (
        <aside className={styles.detailColumn} style={{ width: detailPanelWidth.width }}>
          <CommitDetailPanel
            commit={selectedCommit}
            onSelectFile={setSelectedFilePath}
            onViewChanges={handleViewChanges}
            repositoryPath={selectedRepository.path}
            selectedFilePath={selectedFilePath}
          />
        </aside>
      ) : null}
    </section>
  );
}
