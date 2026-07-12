import { useEffect, useMemo, useState } from "react";
import { InfoCard } from "@core/components/InfoCard";
import { usePersistedState } from "@core/hooks/usePersistedState";
import { readCommits } from "@modules/graph/application/use-cases/readCommits";
import { readStatus } from "@modules/graph/application/use-cases/readStatus";
import { Commit, GraphCommit } from "@modules/graph/domain/commit";
import { WorkingStatus, WORKING_CHANGES_COMMIT_ID } from "@modules/graph/domain/workingStatus";
import { createCommitReader } from "@modules/graph/infrastructure/CommitReaderProvider";
import { createStatusReader } from "@modules/graph/infrastructure/StatusReaderProvider";
import { buildGraphCommits } from "@modules/graph/lib/buildGraphCommits";
import { insertStashCommits } from "@modules/graph/lib/insertStashCommits";
import { calculateGraphWidth } from "@modules/graph/render/graphRenderConfig";
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
  onSelectCommit: (commitId: string) => void;
  onCommitsLoaded?: (commits: GraphCommit[]) => void;
}

export function CommitGraphPanel({
  repositoryPath,
  selectedBranchName,
  selectedBranchTargetCommit,
  selectedCommitId,
  onSelectCommit,
  onCommitsLoaded
}: CommitGraphPanelProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [workingStatus, setWorkingStatus] = useState<WorkingStatus | null>(null);
  const [stashEntries, setStashEntries] = useState<StashEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAuthor, setShowAuthor] = usePersistedState("gitmap.historyMap.showAuthor", true);
  const [showDate, setShowDate] = usePersistedState("gitmap.historyMap.showDate", true);
  const [showMessage, setShowMessage] = usePersistedState("gitmap.historyMap.showMessage", true);

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
  }, [repositoryPath]);

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

  const graphWidth = useMemo(() => {
    const maxLaneCount = graphCommits.reduce(
      (max, commit) => Math.max(max, commit.laneCount),
      1
    );

    return calculateGraphWidth(maxLaneCount);
  }, [graphCommits]);

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

  return (
    <InfoCard
      fillHeight
      headerActions={
        <HistoryMapOptionsMenu
          onToggleAuthor={() => setShowAuthor((current) => !current)}
          onToggleDate={() => setShowDate((current) => !current)}
          onToggleMessage={() => setShowMessage((current) => !current)}
          showAuthor={showAuthor}
          showDate={showDate}
          showMessage={showMessage}
        />
      }
    >
      {error ? <p className={styles.error}>{error}</p> : null}

      {!error ? (
        <div className={styles.commitList}>
          {graphCommits.map((commit) => (
            <CommitGraphRow
              key={commit.id}
              commit={commit}
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
            />
          ))}
        </div>
      ) : null}

      {!error && graphCommits.length === 0 ? (
        <p className={styles.empty}>No commits returned by backend.</p>
      ) : null}
    </InfoCard>
  );
}
