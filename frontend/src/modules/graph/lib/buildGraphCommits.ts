import { Commit, GraphCommit } from "@modules/graph/domain/commit";

export function buildGraphCommits(commits: Commit[]): GraphCommit[] {
  const activeLanes: Array<string | null> = [];

  return commits.map((commit) => {
    const incomingLanes = activeLanes
      .map((value, index) => (value !== null ? index : -1))
      .filter((index) => index >= 0);

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

    const outgoingLanes = nextLanes
      .map((value, index) => (value !== null ? index : -1))
      .filter((index) => index >= 0);

    const laneCount = Math.max(
      incomingLanes.length > 0 ? Math.max(...incomingLanes) + 1 : 0,
      outgoingLanes.length > 0 ? Math.max(...outgoingLanes) + 1 : 0,
      lane + 1,
      parentLanes.length > 0 ? Math.max(...parentLanes) + 1 : 0,
      1
    );

    activeLanes.splice(0, activeLanes.length, ...nextLanes);

    while (activeLanes.length > 0 && activeLanes[activeLanes.length - 1] === null) {
      activeLanes.pop();
    }

    return {
      ...commit,
      shortId: commit.id.slice(0, 7),
      lane,
      parentLanes,
      incomingLanes,
      outgoingLanes,
      laneCount
    };
  });
}
