import { useEffect, useMemo, useState } from "react";
import { InfoCard } from "@core/components/InfoCard";
import { readCommits } from "@modules/graph/application/use-cases/readCommits";
import { Commit, GraphCommit } from "@modules/graph/domain/commit";
import { createCommitReader } from "@modules/graph/infrastructure/CommitReaderProvider";
import { buildGraphCommits } from "@modules/graph/lib/buildGraphCommits";
import { calculateGraphWidth } from "@modules/graph/render/graphRenderConfig";
import { CommitGraphRow } from "@modules/graph/ui/CommitGraphRow";
import styles from "./CommitGraphPanel.module.css";

interface CommitGraphPanelProps {
  repositoryPath: string;
  selectedCommitId: string | null;
  onSelectCommit: (commitId: string) => void;
  onCommitsLoaded?: (commits: GraphCommit[]) => void;
}

export function CommitGraphPanel({
  repositoryPath,
  selectedCommitId,
  onSelectCommit,
  onCommitsLoaded
}: CommitGraphPanelProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const commitReader = createCommitReader();

    setError(null);

    readCommits(commitReader, repositoryPath)
      .then(setCommits)
      .catch((currentError: unknown) => {
        setCommits([]);
        setError(
          currentError instanceof Error ? currentError.message : "Unexpected error."
        );
      });
  }, [repositoryPath]);

  const graphCommits = useMemo(() => buildGraphCommits(commits), [commits]);

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
      onSelectCommit(graphCommits[0].id);
    }
  }, [graphCommits, onSelectCommit, selectedCommitId]);

  return (
    <InfoCard title="History map">
      {error ? <p className={styles.error}>{error}</p> : null}

      {!error ? (
        <div className={styles.commitList}>
          {graphCommits.map((commit) => (
            <CommitGraphRow
              key={commit.id}
              commit={commit}
              graphWidth={graphWidth}
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
