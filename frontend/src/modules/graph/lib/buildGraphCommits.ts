import { Commit, GraphCommit } from "@modules/graph/domain/commit";

export function buildGraphCommits(commits: Commit[]): GraphCommit[] {
  const activeLanes: Array<string | null> = [];

  return commits.map((commit) => {
    let lane = activeLanes.findIndex((value) => value === commit.id);

    if (lane === -1) {
      lane = activeLanes.findIndex((value) => value === null);
    }

    if (lane === -1) {
      lane = activeLanes.length;
    }

    while (activeLanes.length <= lane) {
      activeLanes.push(null);
    }

    activeLanes[lane] = commit.id;

    const visibleLanes = activeLanes
      .map((value, index) => (value !== null ? index : -1))
      .filter((index) => index >= 0);

    const nextLanes = [...activeLanes];
    nextLanes[lane] = null;

    const parentLanes = commit.parents.map((parentId, index) => {
      if (index === 0) {
        nextLanes[lane] = parentId;
        return lane;
      }

      let parentLane = nextLanes.findIndex((value) => value === parentId);

      if (parentLane === -1) {
        parentLane = nextLanes.findIndex((value) => value === null);
      }

      if (parentLane === -1) {
        parentLane = nextLanes.length;
      }

      while (nextLanes.length <= parentLane) {
        nextLanes.push(null);
      }

      nextLanes[parentLane] = parentId;
      return parentLane;
    });

    activeLanes.splice(0, activeLanes.length, ...nextLanes);

    while (activeLanes.length > 0 && activeLanes[activeLanes.length - 1] === null) {
      activeLanes.pop();
    }

    return {
      ...commit,
      shortId: commit.id.slice(0, 7),
      lane,
      parentLanes,
      visibleLanes
    };
  });
}
