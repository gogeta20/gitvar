import {
  GraphLayoutConfig
} from "@modules/graph/render/graphRenderConfig";

export function buildConnectorPath(
  fromLane: number,
  toLane: number,
  width: number,
  graphLayout: GraphLayoutConfig
): string {
  const startX = graphLayout.paddingX + fromLane * graphLayout.laneWidth;
  const endX = graphLayout.paddingX + toLane * graphLayout.laneWidth;
  const midY = graphLayout.rowHeight * 0.55;
  const endY = graphLayout.rowHeight;
  const controlY = graphLayout.rowHeight * 0.82;

  if (fromLane === toLane) {
    return `M ${startX} ${midY} L ${endX} ${endY}`;
  }

  const bendX = Math.max(
    graphLayout.dotRadius,
    Math.min(width - graphLayout.dotRadius, endX)
  );

  return `M ${startX} ${midY} C ${startX} ${controlY} ${bendX} ${controlY} ${endX} ${endY}`;
}

export function buildIncomingConnectorPath(
  fromLane: number,
  toLane: number,
  width: number,
  graphLayout: GraphLayoutConfig
): string {
  const startX = graphLayout.paddingX + fromLane * graphLayout.laneWidth;
  const endX = graphLayout.paddingX + toLane * graphLayout.laneWidth;
  const startY = 0;
  const midY = graphLayout.rowHeight * 0.18;
  const endY = graphLayout.rowHeight * 0.5;
  const bendX = Math.max(
    graphLayout.dotRadius,
    Math.min(width - graphLayout.dotRadius, startX)
  );

  return `M ${startX} ${startY} C ${bendX} ${midY} ${endX} ${midY} ${endX} ${endY}`;
}
