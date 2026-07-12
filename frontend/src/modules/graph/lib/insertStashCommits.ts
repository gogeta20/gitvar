import { Commit } from "@modules/graph/domain/commit";
import { StashEntry } from "@modules/stash/domain/stashEntry";

/**
 * Splices a synthetic commit for each stash entry right before its base
 * commit in the (topo-ordered) list, so buildGraphCommits sees it as a
 * one-off child hanging off that point, the same trick used for the
 * synthetic "Uncommitted changes" node.
 */
export function insertStashCommits(commits: Commit[], stashEntries: StashEntry[]): Commit[] {
  const result = [...commits];

  for (const entry of stashEntries) {
    const baseIndex = result.findIndex((commit) => commit.id === entry.baseCommitId);

    if (baseIndex === -1) {
      continue;
    }

    const stashCommit: Commit = {
      id: entry.commitId,
      parents: [entry.baseCommitId],
      refs: [entry.reference],
      authorName: "",
      authorEmail: "",
      authoredAt: "",
      message: entry.message,
      isStash: true
    };

    result.splice(baseIndex, 0, stashCommit);
  }

  return result;
}
