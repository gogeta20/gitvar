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

const LANE_WIDTH = 28;
const ROW_HEIGHT = 46;
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

function buildIncomingConnectorPath(
  fromLane: number,
  toLane: number,
  width: number
): string {
  const startX = SVG_PADDING_X + fromLane * LANE_WIDTH;
  const endX = SVG_PADDING_X + toLane * LANE_WIDTH;
  const startY = 0;
  const midY = ROW_HEIGHT * 0.18;
  const endY = ROW_HEIGHT * 0.5;
  const bendX = Math.max(DOT_RADIUS, Math.min(width - DOT_RADIUS, startX));

  return `M ${startX} ${startY} C ${bendX} ${midY} ${endX} ${midY} ${endX} ${endY}`;
}

function resolveLaneColor(lane: number): string {
  return LANE_COLORS[lane % LANE_COLORS.length];
}

function GraphRow({
  commit,
  graphWidth,
  isSelected,
  onSelect
}: {
  commit: GraphCommit;
  graphWidth: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
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
        {commit.passthroughLanes.map((lane) => {
          const x = SVG_PADDING_X + lane * LANE_WIDTH;

          return (
            <line
              key={`passthrough-${commit.id}-${lane}`}
              className={styles.graphLine}
              style={{ stroke: resolveLaneColor(lane) }}
              x1={x}
              x2={x}
              y1="0"
              y2={ROW_HEIGHT}
            />
          );
        })}

        {!commit.isBranchTip ? (
          <line
            className={styles.graphLine}
            style={{ stroke: resolveLaneColor(commit.lane) }}
            x1={dotX}
            x2={dotX}
            y1="0"
            y2={dotY}
          />
        ) : null}

        {commit.convergingLanes.map((lane) => (
          <path
            key={`converge-${commit.id}-${lane}`}
            className={styles.graphPath}
            style={{ stroke: resolveLaneColor(lane) }}
            d={buildIncomingConnectorPath(lane, commit.lane, graphWidth)}
          />
        ))}

        {commit.parents.length > 0 ? (
          <line
            className={styles.graphLine}
            style={{ stroke: resolveLaneColor(commit.lane) }}
            x1={dotX}
            x2={dotX}
            y1={dotY}
            y2={ROW_HEIGHT}
          />
        ) : null}

        {commit.parentLanes
          .filter((lane) => lane !== commit.lane)
          .map((lane, index) => (
          <path
            key={`split-${commit.id}-${lane}-${index}`}
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

      <div className={styles.contentCell}>
        <div className={styles.mainRow}>
          <div className={styles.messageCell}>
            <strong>{commit.message}</strong>
            {commit.refs.length > 0 ? (
              commit.refs.map((ref) => (
                <span key={ref} className={styles.refText}>
                  {ref}
                </span>
              ))
            ) : null}
          </div>

          <div className={styles.metaRow}>
            <span className={styles.authorCell}>{commit.authorName}</span>
            <span className={styles.dateCell}>{formatDateLabel(commit.authoredAt)}</span>
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

  const graphWidth = useMemo(() => {
    const maxLaneCount = graphCommits.reduce(
      (max, commit) => Math.max(max, commit.laneCount),
      1
    );

    return SVG_PADDING_X * 2 + Math.max(1, maxLaneCount - 1) * LANE_WIDTH + 2;
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
            <GraphRow
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
