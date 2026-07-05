export const GRAPH_LANE_WIDTH = 24;
export const GRAPH_ROW_HEIGHT = 34;
export const GRAPH_SVG_PADDING_X = 10;
export const GRAPH_DOT_RADIUS = 4;

const GRAPH_LANE_COLORS = [
  "var(--color-graph-lane-0)",
  "var(--color-graph-lane-1)",
  "var(--color-graph-lane-2)",
  "var(--color-graph-lane-3)"
];

export function resolveLaneColor(lane: number): string {
  return GRAPH_LANE_COLORS[lane % GRAPH_LANE_COLORS.length];
}

export function calculateGraphWidth(maxLaneCount: number): number {
  return (
    GRAPH_SVG_PADDING_X * 2 +
    Math.max(1, maxLaneCount - 1) * GRAPH_LANE_WIDTH +
    2
  );
}
