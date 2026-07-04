import { useEffect, useMemo, useState } from "react";
import { InfoCard } from "@core/components/InfoCard";
import { readCommits } from "@modules/graph/application/use-cases/readCommits";
import { Commit, GraphCommit } from "@modules/graph/domain/commit";
import { createCommitReader } from "@modules/graph/infrastructure/CommitReaderProvider";
import { buildGraphCommits } from "@modules/graph/lib/buildGraphCommits";
import styles from "./CommitGraphPanel.module.css";

interface CommitGraphPanelProps {
  repositoryPath: string;
  selectedCommitId: string | null;
  onSelectCommit: (commitId: string) => void;
  onCommitsLoaded?: (commits: GraphCommit[]) => void;
}

const LANE_WIDTH = 22;
const ROW_HEIGHT = 72;
const SVG_PADDING_X = 10;
const DOT_RADIUS = 5;
const LANE_COLORS = [
  "var(--color-graph-lane-0)",
  "var(--color-graph-lane-1)",
  "var(--color-graph-lane-2)",
  "var(--color-graph-lane-3)"
];

function formatDateLabel(input: string): string {
  const date = new Date(input);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function buildConnectorPath(
  fromLane: number,
  toLane: number,
  width: number
): string {
  const startX = SVG_PADDING_X + fromLane * LANE_WIDTH;
  const endX = SVG_PADDING_X + toLane * LANE_WIDTH;
  const midY = ROW_HEIGHT * 0.55;
  const endY = ROW_HEIGHT;
  const controlY = ROW_HEIGHT * 0.82;

  if (fromLane === toLane) {
    return `M ${startX} ${midY} L ${endX} ${endY}`;
  }

  const bendX = Math.max(DOT_RADIUS, Math.min(width - DOT_RADIUS, endX));

  return `M ${startX} ${midY} C ${startX} ${controlY} ${bendX} ${controlY} ${endX} ${endY}`;
}

function resolveLaneColor(lane: number): string {
  return LANE_COLORS[lane % LANE_COLORS.length];
}

function GraphRow({
  commit,
  isSelected,
  onSelect
}: {
  commit: GraphCommit;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const laneCount = commit.laneCount;
  const graphWidth = SVG_PADDING_X * 2 + Math.max(1, laneCount - 1) * LANE_WIDTH + 2;
  const dotX = SVG_PADDING_X + commit.lane * LANE_WIDTH;
  const dotY = ROW_HEIGHT * 0.5;

  return (
    <button
      className={isSelected ? styles.commitRowActive : styles.commitRow}
      onClick={onSelect}
      type="button"
    >
      <svg
        className={styles.graphSvg}
        viewBox={`0 0 ${graphWidth} ${ROW_HEIGHT}`}
        preserveAspectRatio="none"
      >
        {commit.incomingLanes.map((lane) => {
          const x = SVG_PADDING_X + lane * LANE_WIDTH;

          return (
            <line
              key={`incoming-${commit.id}-${lane}`}
              className={styles.graphLine}
              style={{ stroke: resolveLaneColor(lane) }}
              x1={x}
              x2={x}
              y1="0"
              y2={dotY}
            />
          );
        })}

        {commit.outgoingLanes.map((lane) => {
          const x = SVG_PADDING_X + lane * LANE_WIDTH;

          return (
            <line
              key={`outgoing-${commit.id}-${lane}`}
              className={styles.graphLine}
              style={{ stroke: resolveLaneColor(lane) }}
              x1={x}
              x2={x}
              y1={dotY}
              y2={ROW_HEIGHT}
            />
          );
        })}

        {commit.parentLanes
          .filter((lane) => lane !== commit.lane)
          .map((lane, index) => (
          <path
            key={`parent-${commit.id}-${lane}-${index}`}
            className={styles.graphPath}
            style={{ stroke: resolveLaneColor(lane) }}
            d={buildConnectorPath(commit.lane, lane, graphWidth)}
          />
          ))}

        <circle
          className={styles.graphDot}
          cx={dotX}
          cy={dotY}
          r={DOT_RADIUS}
          style={{ fill: resolveLaneColor(commit.lane) }}
        />
      </svg>

      <div className={styles.commitBody}>
        <div className={styles.commitTopline}>
          <strong>{commit.message}</strong>
          <span>{formatDateLabel(commit.authoredAt)}</span>
        </div>
        <div className={styles.commitMeta}>
          <span>
            {commit.shortId} · {commit.authorName}
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
            <GraphRow
              key={commit.id}
              commit={commit}
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
