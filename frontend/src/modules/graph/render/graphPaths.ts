import {
  GRAPH_DOT_RADIUS,
  GRAPH_LANE_WIDTH,
  GRAPH_ROW_HEIGHT,
  GRAPH_SVG_PADDING_X
} from "@modules/graph/render/graphRenderConfig";

export function buildConnectorPath(
  fromLane: number,
  toLane: number,
  width: number
): string {
  const startX = GRAPH_SVG_PADDING_X + fromLane * GRAPH_LANE_WIDTH;
  const endX = GRAPH_SVG_PADDING_X + toLane * GRAPH_LANE_WIDTH;
  const midY = GRAPH_ROW_HEIGHT * 0.55;
  const endY = GRAPH_ROW_HEIGHT;
  const controlY = GRAPH_ROW_HEIGHT * 0.82;

  if (fromLane === toLane) {
    return `M ${startX} ${midY} L ${endX} ${endY}`;
  }

  const bendX = Math.max(GRAPH_DOT_RADIUS, Math.min(width - GRAPH_DOT_RADIUS, endX));

  return `M ${startX} ${midY} C ${startX} ${controlY} ${bendX} ${controlY} ${endX} ${endY}`;
}

export function buildIncomingConnectorPath(
  fromLane: number,
  toLane: number,
  width: number
): string {
  const startX = GRAPH_SVG_PADDING_X + fromLane * GRAPH_LANE_WIDTH;
  const endX = GRAPH_SVG_PADDING_X + toLane * GRAPH_LANE_WIDTH;
  const startY = 0;
  const midY = GRAPH_ROW_HEIGHT * 0.18;
  const endY = GRAPH_ROW_HEIGHT * 0.5;
  const bendX = Math.max(GRAPH_DOT_RADIUS, Math.min(width - GRAPH_DOT_RADIUS, startX));

  return `M ${startX} ${startY} C ${bendX} ${midY} ${endX} ${midY} ${endX} ${endY}`;
}
