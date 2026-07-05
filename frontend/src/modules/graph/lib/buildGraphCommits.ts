import { Commit, GraphCommit } from "@modules/graph/domain/commit";

/**
 * Layout basado en el algoritmo clasico de `git log --graph`: cada commit
 * reclama una columna, los padres heredan o reclaman columnas propias, y
 * cuando varias columnas esperan al mismo commit convergen en una sola.
 */
export function buildGraphCommits(commits: Commit[]): GraphCommit[] {
  const columns: Array<string | null> = [];

  function claimColumn(): number {
    const freeIndex = columns.findIndex((value) => value === null);

    if (freeIndex !== -1) {
      return freeIndex;
    }

    columns.push(null);
    return columns.length - 1;
  }

  return commits.map((commit) => {
    const activeColumnsBefore = columns
      .map((value, index) => (value !== null ? index : -1))
      .filter((index) => index >= 0);

    const matchingColumns = columns
      .map((value, index) => (value === commit.id ? index : -1))
      .filter((index) => index >= 0);

    const isBranchTip = matchingColumns.length === 0;
    const lane = isBranchTip ? claimColumn() : matchingColumns[0];
    const convergingLanes = matchingColumns.filter((column) => column !== lane);
    const childCount = matchingColumns.length;

    matchingColumns.forEach((column) => {
      columns[column] = null;
    });

    const parentLanes = commit.parents.map((parentId, index) => {
      const column = index === 0 ? lane : claimColumn();
      columns[column] = parentId;
      return column;
    });

    const passthroughLanes = activeColumnsBefore.filter(
      (column) => column !== lane && !convergingLanes.includes(column)
    );

    const laneCount = Math.max(
      lane + 1,
      ...convergingLanes.map((column) => column + 1),
      ...parentLanes.map((column) => column + 1),
      ...passthroughLanes.map((column) => column + 1),
      1
    );

    while (columns.length > 0 && columns[columns.length - 1] === null) {
      columns.pop();
    }

    return {
      ...commit,
      shortId: commit.id.slice(0, 7),
      lane,
      parentLanes,
      convergingLanes,
      passthroughLanes,
      isBranchTip,
      childCount,
      laneCount
    };
  });
}
