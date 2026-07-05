const HEAD_PREFIX = "HEAD -> ";

export interface ResolvedCommitRefs {
  primary: string | null;
  otherRefs: string[];
  isCurrentBranch: boolean;
}

/**
 * Git can stack several branch tips on the same commit. Pick one label to
 * show (preferring the checked-out branch via the "HEAD -> " marker) and
 * keep the rest as an overflow list instead of cramming every ref inline.
 */
export function resolveCommitRefs(refs: string[]): ResolvedCommitRefs {
  if (refs.length === 0) {
    return { primary: null, otherRefs: [], isCurrentBranch: false };
  }

  const headRef = refs.find((ref) => ref.startsWith(HEAD_PREFIX));
  const primaryRaw = headRef ?? refs[0];
  const primary = headRef ? headRef.slice(HEAD_PREFIX.length) : primaryRaw;
  const otherRefs = refs.filter((ref) => ref !== primaryRaw);

  return { primary, otherRefs, isCurrentBranch: Boolean(headRef) };
}
