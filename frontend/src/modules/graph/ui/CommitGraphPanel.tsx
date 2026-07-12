import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { IconButton } from "@core/components/IconButton";
import { InfoCard } from "@core/components/InfoCard";
import { usePersistedState } from "@core/hooks/usePersistedState";
import { CurrentBranchBadge } from "@modules/branches/ui/CurrentBranchBadge";
import { readCommits } from "@modules/graph/application/use-cases/readCommits";
import { readStatus } from "@modules/graph/application/use-cases/readStatus";
import { Commit, GraphCommit } from "@modules/graph/domain/commit";
import { WorkingStatus, WORKING_CHANGES_COMMIT_ID } from "@modules/graph/domain/workingStatus";
import { createCommitReader } from "@modules/graph/infrastructure/CommitReaderProvider";
import { createStatusReader } from "@modules/graph/infrastructure/StatusReaderProvider";
import { buildGraphCommits } from "@modules/graph/lib/buildGraphCommits";
import { insertStashCommits } from "@modules/graph/lib/insertStashCommits";
import {
  calculateGraphWidth,
  resolveGraphLayout
} from "@modules/graph/render/graphRenderConfig";
import { CommitGraphRow } from "@modules/graph/ui/CommitGraphRow";
import { HistoryMapOptionsMenu } from "@modules/graph/ui/HistoryMapOptionsMenu";
import { readStash } from "@modules/stash/application/use-cases/readStash";
import { StashEntry } from "@modules/stash/domain/stashEntry";
import { createStashReader } from "@modules/stash/infrastructure/StashReaderProvider";
import styles from "./CommitGraphPanel.module.css";

interface CommitGraphPanelProps {
  repositoryPath: string;
  selectedBranchName: string | null;
  selectedBranchTargetCommit: string | null;
  selectedCommitId: string | null;
  isSidebarOpen: boolean;
  isDetailOpen: boolean;
  onToggleSidebar: () => void;
  onToggleDetail: () => void;
  onSelectCommit: (commitId: string) => void;
  onCommitsLoaded?: (commits: GraphCommit[]) => void;
  refreshToken?: number;
}

export function CommitGraphPanel({
  repositoryPath,
  selectedBranchName,
  selectedBranchTargetCommit,
  selectedCommitId,
  isSidebarOpen,
  isDetailOpen,
  onToggleSidebar,
  onToggleDetail,
  onSelectCommit,
  onCommitsLoaded,
  refreshToken
}: CommitGraphPanelProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [workingStatus, setWorkingStatus] = useState<WorkingStatus | null>(null);
  const [stashEntries, setStashEntries] = useState<StashEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAuthor, setShowAuthor] = usePersistedState("gitmap.historyMap.showAuthor", true);
  const [showDate, setShowDate] = usePersistedState("gitmap.historyMap.showDate", true);
  const [showMessage, setShowMessage] = usePersistedState("gitmap.historyMap.showMessage", true);
  const topScrollbarRef = useRef<HTMLDivElement | null>(null);
  const contentViewportRef = useRef<HTMLDivElement | null>(null);
  const isSyncingScrollRef = useRef(false);
  const selectedRowRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const commitReader = createCommitReader();
    const statusReader = createStatusReader();
    const stashReader = createStashReader();

    setError(null);

    Promise.all([
      readCommits(commitReader, repositoryPath),
      readStatus(statusReader, repositoryPath),
      readStash(stashReader, repositoryPath)
    ])
      .then(([nextCommits, nextStatus, nextStashEntries]) => {
        setCommits(nextCommits);
        setWorkingStatus(nextStatus);
        setStashEntries(nextStashEntries);
      })
      .catch((currentError: unknown) => {
        setCommits([]);
        setWorkingStatus(null);
        setStashEntries([]);
        setError(
          currentError instanceof Error ? currentError.message : "Unexpected error."
        );
      });
  }, [repositoryPath, refreshToken]);

  const commitsWithWorkingChanges = useMemo(() => {
    if (!workingStatus?.isDirty) {
      return commits;
    }

    const workingChangesCommit: Commit = {
      id: WORKING_CHANGES_COMMIT_ID,
      parents: [workingStatus.headCommitId],
      refs: [],
      authorName: "",
      authorEmail: "",
      authoredAt: "",
      message: "Uncommitted changes",
      isWorkingChanges: true
    };

    return [workingChangesCommit, ...commits];
  }, [commits, workingStatus]);

  const commitsWithSynthetic = useMemo(
    () => insertStashCommits(commitsWithWorkingChanges, stashEntries),
    [commitsWithWorkingChanges, stashEntries]
  );

  const graphCommits = useMemo(
    () => buildGraphCommits(commitsWithSynthetic),
    [commitsWithSynthetic]
  );

  const maxLaneCount = useMemo(
    () => graphCommits.reduce((max, commit) => Math.max(max, commit.laneCount), 1),
    [graphCommits]
  );

  const graphLayout = useMemo(
    () => resolveGraphLayout(maxLaneCount),
    [maxLaneCount]
  );

  const graphWidth = useMemo(
    () => calculateGraphWidth(maxLaneCount, graphLayout),
    [graphLayout, maxLaneCount]
  );

  const historyMinWidth = useMemo(() => {
    const contentMinWidth =
      (showMessage ? 420 : 0) +
      (showAuthor ? graphLayout.authorMaxWidth + 24 : 0) +
      (showDate ? 132 : 0);

    return (
      graphLayout.refColumnMaxWidth +
      graphWidth +
      contentMinWidth +
      graphLayout.rowColumnGap * 2 +
      48
    );
  }, [
    graphLayout.authorMaxWidth,
    graphLayout.refColumnMaxWidth,
    graphLayout.rowColumnGap,
    graphWidth,
    showAuthor,
    showDate,
    showMessage
  ]);

  useEffect(() => {
    onCommitsLoaded?.(graphCommits);
  }, [graphCommits, onCommitsLoaded]);

  useEffect(() => {
    if (graphCommits.length > 0 && !selectedCommitId) {
      const firstRealCommit =
        graphCommits.find((commit) => !commit.isWorkingChanges && !commit.isStash) ??
        graphCommits[0];

      onSelectCommit(firstRealCommit.id);
    }
  }, [graphCommits, onSelectCommit, selectedCommitId]);

  useEffect(() => {
    selectedRowRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedCommitId, graphCommits]);

  function syncHorizontalScroll(
    source: HTMLDivElement | null,
    target: HTMLDivElement | null
  ) {
    if (!source || !target) {
      return;
    }

    if (isSyncingScrollRef.current) {
      return;
    }

    isSyncingScrollRef.current = true;
    target.scrollLeft = source.scrollLeft;

    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  }

  return (
    <InfoCard
      fillHeight
      title={
        <div className={styles.headerCluster}>
          <IconButton
            icon={isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            onClick={onToggleSidebar}
          />
          <CurrentBranchBadge repositoryPath={repositoryPath} />
        </div>
      }
      headerActions={
        <div className={styles.headerCluster}>
          <HistoryMapOptionsMenu
            onToggleAuthor={() => setShowAuthor((current) => !current)}
            onToggleDate={() => setShowDate((current) => !current)}
            onToggleMessage={() => setShowMessage((current) => !current)}
            showAuthor={showAuthor}
            showDate={showDate}
            showMessage={showMessage}
          />
          <IconButton
            icon={isDetailOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            label={isDetailOpen ? "Hide commit detail panel" : "Show commit detail panel"}
            onClick={onToggleDetail}
          />
        </div>
      }
    >
      {error ? <p className={styles.error}>{error}</p> : null}

      {!error ? (
        <div
          ref={topScrollbarRef}
          className={styles.topScrollbar}
          onScroll={() =>
            syncHorizontalScroll(topScrollbarRef.current, contentViewportRef.current)
          }
        >
          <div
            className={styles.topScrollbarInner}
            style={{ "--history-min-width": `${historyMinWidth}px` } as CSSProperties}
          />
        </div>
      ) : null}

      {!error ? (
        <div
          ref={contentViewportRef}
          className={styles.commitListViewport}
          onScroll={() =>
            syncHorizontalScroll(contentViewportRef.current, topScrollbarRef.current)
          }
        >
          <div
            className={styles.commitList}
            style={{ "--history-min-width": `${historyMinWidth}px` } as CSSProperties}
          >
            {graphCommits.map((commit) => (
              <CommitGraphRow
                key={commit.id}
                commit={commit}
                graphLayout={graphLayout}
                graphWidth={graphWidth}
                selectedBranchName={selectedBranchName}
                showAuthor={showAuthor}
                showDate={showDate}
                showMessage={showMessage}
                isBranchRefSelected={Boolean(
                  selectedBranchName &&
                    commit.refs.some(
                      (ref) =>
                        ref === selectedBranchName ||
                        ref === `HEAD -> ${selectedBranchName}`
                    )
                )}
                isBranchTarget={commit.id === selectedBranchTargetCommit}
                isSelected={commit.id === selectedCommitId}
                onSelect={() => onSelectCommit(commit.id)}
                rowRef={commit.id === selectedCommitId ? (element) => {
                  selectedRowRef.current = element;
                } : undefined}
              />
            ))}
          </div>
        </div>
      ) : null}

      {!error && graphCommits.length === 0 ? (
        <p className={styles.empty}>No commits returned by backend.</p>
      ) : null}
    </InfoCard>
  );
}
