export type GraphDensity = "regular" | "dense" | "compact";

export interface GraphLayoutConfig {
  density: GraphDensity;
  laneWidth: number;
  rowHeight: number;
  paddingX: number;
  dotRadius: number;
  minWidth: number;
  refColumnMaxWidth: number;
  refLabelMaxWidth: number;
  authorMaxWidth: number;
  rowColumnGap: number;
  contentGap: number;
}

export const GRAPH_ROW_HEIGHT = 34;

const GRAPH_LANE_COLORS = [
  "var(--color-graph-lane-0)",
  "var(--color-graph-lane-1)",
  "var(--color-graph-lane-2)",
  "var(--color-graph-lane-3)"
];

export function resolveLaneColor(lane: number): string {
  return GRAPH_LANE_COLORS[lane % GRAPH_LANE_COLORS.length];
}

export function resolveGraphLayout(maxLaneCount: number): GraphLayoutConfig {
  if (maxLaneCount > 20) {
    return {
      density: "compact",
      laneWidth: 20,
      rowHeight: GRAPH_ROW_HEIGHT,
      paddingX: 8,
      dotRadius: 3.5,
      minWidth: 84,
      refColumnMaxWidth: 240,
      refLabelMaxWidth: 180,
      authorMaxWidth: 96,
      rowColumnGap: 8,
      contentGap: 10
    };
  }

  if (maxLaneCount > 12) {
    return {
      density: "dense",
      laneWidth: 24,
      rowHeight: GRAPH_ROW_HEIGHT,
      paddingX: 9,
      dotRadius: 4,
      minWidth: 88,
      refColumnMaxWidth: 280,
      refLabelMaxWidth: 240,
      authorMaxWidth: 118,
      rowColumnGap: 10,
      contentGap: 11
    };
  }

  return {
    density: "regular",
    laneWidth: 28,
    rowHeight: GRAPH_ROW_HEIGHT,
    paddingX: 10,
    dotRadius: 4,
    minWidth: 92,
    refColumnMaxWidth: 320,
    refLabelMaxWidth: 320,
    authorMaxWidth: 140,
    rowColumnGap: 12,
    contentGap: 12
  };
}

export function calculateGraphWidth(
  maxLaneCount: number,
  graphLayout: GraphLayoutConfig
): number {
  return Math.max(
    graphLayout.minWidth,
    graphLayout.paddingX * 2 +
      Math.max(1, maxLaneCount - 1) * graphLayout.laneWidth +
      2
  );
}
