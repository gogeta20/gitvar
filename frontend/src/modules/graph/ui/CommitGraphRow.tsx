import type { CSSProperties } from "react";
import { Tooltip } from "@core/components/Tooltip";
import { GraphCommit } from "@modules/graph/domain/commit";
import { resolveCommitRefs } from "@modules/graph/lib/resolveCommitRefs";
import { resolveLaneColor } from "@modules/graph/render/graphRenderConfig";
import { CommitGraphSvg } from "@modules/graph/render/CommitGraphSvg";
import styles from "./CommitGraphPanel.module.css";

interface CommitGraphRowProps {
  commit: GraphCommit;
  graphWidth: number;
  isSelected: boolean;
  onSelect: () => void;
}

function formatDateLabel(input: string): string {
  const date = new Date(input);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function CommitGraphRow({
  commit,
  graphWidth,
  isSelected,
  onSelect
}: CommitGraphRowProps) {
  const laneColor = resolveLaneColor(commit.lane);
  const { primary, otherRefs } = resolveCommitRefs(commit.refs);

  return (
    <button
      className={isSelected ? styles.commitRowActive : styles.commitRow}
      onClick={onSelect}
      style={{ "--lane-color": laneColor } as CSSProperties}
      type="button"
    >
      <div className={styles.refsCell}>
        {primary ? (
          <span className={styles.refText} title={primary}>
            {primary}
          </span>
        ) : null}
        {otherRefs.length > 0 ? (
          <Tooltip items={otherRefs}>
            <span className={styles.refCountBadge}>+{otherRefs.length}</span>
          </Tooltip>
        ) : null}
      </div>

      <div className={styles.graphCell}>
        <CommitGraphSvg commit={commit} graphWidth={graphWidth} />
        {commit.childCount > 1 ? (
          <span className={styles.divergenceBadge} title={`${commit.childCount} branches diverge here`}>
            {commit.childCount}
          </span>
        ) : null}
      </div>

      <div className={styles.contentCell}>
        <div className={styles.mainRow}>
          {!commit.isWorkingChanges ? (
            <span className={styles.authorCell}>{commit.authorName}</span>
          ) : null}

          <div className={styles.messageCell}>
            <strong className={commit.isWorkingChanges ? styles.workingChangesMessage : undefined}>
              {commit.message}
            </strong>
          </div>

          {!commit.isWorkingChanges ? (
            <span className={styles.dateCell}>{formatDateLabel(commit.authoredAt)}</span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
