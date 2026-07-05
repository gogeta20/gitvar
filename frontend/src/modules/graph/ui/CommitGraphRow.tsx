import { GraphCommit } from "@modules/graph/domain/commit";
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
  return (
    <button
      className={isSelected ? styles.commitRowActive : styles.commitRow}
      onClick={onSelect}
      type="button"
    >
      <CommitGraphSvg commit={commit} graphWidth={graphWidth} />

      <div className={styles.contentCell}>
        <div className={styles.mainRow}>
          <div className={styles.messageCell}>
            <strong className={commit.isWorkingChanges ? styles.workingChangesMessage : undefined}>
              {commit.message}
            </strong>
            {commit.refs.length > 0
              ? commit.refs.map((ref) => (
                  <span key={ref} className={styles.refText}>
                    {ref}
                  </span>
                ))
              : null}
          </div>

          {!commit.isWorkingChanges ? (
            <div className={styles.metaRow}>
              <span className={styles.authorCell}>{commit.authorName}</span>
              <span className={styles.dateCell}>{formatDateLabel(commit.authoredAt)}</span>
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}
