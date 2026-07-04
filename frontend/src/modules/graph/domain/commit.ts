export interface Commit {
  id: string;
  parents: string[];
  refs: string[];
  authorName: string;
  authorEmail: string;
  authoredAt: string;
  message: string;
}

export interface GraphCommit extends Commit {
  shortId: string;
  lane: number;
  parentLanes: number[];
  visibleLanes: number[];
}
