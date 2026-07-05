import type { CSSProperties } from "react";
import { GraphCommit } from "@modules/graph/domain/commit";
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

  return (
    <button
      className={isSelected ? styles.commitRowActive : styles.commitRow}
      onClick={onSelect}
      style={{ "--lane-color": laneColor } as CSSProperties}
      type="button"
    >
      <div className={styles.refsCell}>
        {commit.refs.length > 0
          ? commit.refs.map((ref) => (
              <span key={ref} className={styles.refText} title={ref}>
                {ref}
              </span>
            ))
          : null}
      </div>

      <div className={styles.graphCell}>
        <CommitGraphSvg commit={commit} graphWidth={graphWidth} />
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
