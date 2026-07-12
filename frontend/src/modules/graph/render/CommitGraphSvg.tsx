import { GitMerge, Package } from "lucide-react";
import { GraphCommit } from "@modules/graph/domain/commit";
import {
  GRAPH_DOT_RADIUS,
  GRAPH_LANE_WIDTH,
  GRAPH_ROW_HEIGHT,
  GRAPH_SVG_PADDING_X,
  resolveLaneColor
} from "@modules/graph/render/graphRenderConfig";
import {
  buildConnectorPath,
  buildIncomingConnectorPath
} from "@modules/graph/render/graphPaths";
import styles from "@modules/graph/ui/CommitGraphPanel.module.css";

interface CommitGraphSvgProps {
  commit: GraphCommit;
  graphWidth: number;
}

export function CommitGraphSvg({
  commit,
  graphWidth
}: CommitGraphSvgProps) {
  const dotX = GRAPH_SVG_PADDING_X + commit.lane * GRAPH_LANE_WIDTH;
  const dotY = GRAPH_ROW_HEIGHT * 0.5;
  const isMergeCommit =
    !commit.isWorkingChanges && !commit.isStash && commit.parents.length > 1;
  const iconSize = GRAPH_DOT_RADIUS * 3;
  const iconOffset = iconSize / 2;

  return (
    <svg
      className={styles.graphSvg}
      viewBox={`0 0 ${graphWidth} ${GRAPH_ROW_HEIGHT}`}
      preserveAspectRatio="none"
    >
      {commit.passthroughLanes.map((lane) => {
        const x = GRAPH_SVG_PADDING_X + lane * GRAPH_LANE_WIDTH;

        return (
          <line
            key={`passthrough-${commit.id}-${lane}`}
            className={styles.graphLine}
            style={{ stroke: resolveLaneColor(lane) }}
            x1={x}
            x2={x}
            y1="0"
            y2={GRAPH_ROW_HEIGHT}
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
          style={{
            stroke: resolveLaneColor(commit.lane),
            strokeDasharray: commit.isWorkingChanges ? "4 3" : commit.isStash ? "2 2" : undefined
          }}
          x1={dotX}
          x2={dotX}
          y1={dotY}
          y2={GRAPH_ROW_HEIGHT}
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

      {commit.isStash || isMergeCommit ? (
        <circle cx={dotX} cy={dotY} r={GRAPH_DOT_RADIUS * 1.8} fill="var(--color-bg-elevated)" />
      ) : null}

      {commit.isStash ? (
        <Package
          color="var(--color-text-accent)"
          height={iconSize}
          strokeWidth={2.5}
          width={iconSize}
          x={dotX - iconOffset}
          y={dotY - iconOffset}
        />
      ) : isMergeCommit ? (
        <GitMerge
          color={resolveLaneColor(commit.lane)}
          height={iconSize}
          strokeWidth={2.5}
          width={iconSize}
          x={dotX - iconOffset}
          y={dotY - iconOffset}
        />
      ) : (
        <circle
          className={styles.graphDot}
          cx={dotX}
          cy={dotY}
          r={GRAPH_DOT_RADIUS}
          style={
            commit.isWorkingChanges
              ? { fill: "transparent", stroke: resolveLaneColor(commit.lane) }
              : { fill: resolveLaneColor(commit.lane) }
          }
        />
      )}
    </svg>
  );
}
