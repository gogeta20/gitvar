export interface Commit {
  id: string;
  parents: string[];
  refs: string[];
  authorName: string;
  authorEmail: string;
  authoredAt: string;
  message: string;
  isWorkingChanges?: boolean;
}

export interface GraphCommit extends Commit {
  shortId: string;
  lane: number;
  parentLanes: number[];
  convergingLanes: number[];
  passthroughLanes: number[];
  isBranchTip: boolean;
  laneCount: number;
}
