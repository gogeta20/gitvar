import type { CSSProperties } from "react";
import { Tooltip } from "@core/components/Tooltip";
import { GraphCommit } from "@modules/graph/domain/commit";
import { resolveCommitRefs } from "@modules/graph/lib/resolveCommitRefs";
import {
  GraphLayoutConfig,
  resolveLaneColor
} from "@modules/graph/render/graphRenderConfig";
import { CommitGraphSvg } from "@modules/graph/render/CommitGraphSvg";
import styles from "./CommitGraphPanel.module.css";

interface CommitGraphRowProps {
  commit: GraphCommit;
  graphLayout: GraphLayoutConfig;
  graphWidth: number;
  selectedBranchName: string | null;
  isBranchRefSelected: boolean;
  isBranchTarget: boolean;
  isSelected: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showMessage: boolean;
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
  graphLayout,
  graphWidth,
  selectedBranchName,
  isBranchRefSelected,
  isBranchTarget,
  isSelected,
  showAuthor,
  showDate,
  showMessage,
  onSelect
}: CommitGraphRowProps) {
  const laneColor = resolveLaneColor(commit.lane);
  const { primary, otherRefs, isCurrentBranch } = resolveCommitRefs(
    commit.refs,
    selectedBranchName
  );
  const hasVisibleContent = showAuthor || showDate || showMessage;

  const rowClassName = [
    isSelected ? styles.commitRowActive : isBranchTarget ? styles.commitRowBranchTarget : styles.commitRow,
    hasVisibleContent ? null : styles.commitRowCollapsedContent,
    commit.isStash ? styles.commitRowStash : null
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={rowClassName}
      onClick={onSelect}
      style={
        {
          "--lane-color": laneColor,
          "--graph-width": `${graphWidth}px`,
          "--refs-column-max-width": `${graphLayout.refColumnMaxWidth}px`,
          "--ref-label-max-width": `${graphLayout.refLabelMaxWidth}px`,
          "--author-max-width": `${graphLayout.authorMaxWidth}px`,
          "--row-column-gap": `${graphLayout.rowColumnGap}px`,
          "--content-gap": `${graphLayout.contentGap}px`
        } as CSSProperties
      }
      type="button"
    >
      <div className={styles.refsCell}>
        {primary ? (
          <span
            className={
              commit.isStash
                ? styles.refTextStash
                : isBranchRefSelected
                  ? styles.refTextSelected
                  : isCurrentBranch
                    ? styles.refTextCurrent
                    : styles.refText
            }
            title={primary}
          >
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
        <CommitGraphSvg commit={commit} graphLayout={graphLayout} graphWidth={graphWidth} />
        {commit.childCount > 1 ? (
          <span className={styles.divergenceBadge} title={`${commit.childCount} branches diverge here`}>
            {commit.childCount}
          </span>
        ) : null}
      </div>

      {hasVisibleContent ? (
        <div className={styles.contentCell}>
          <div className={styles.mainRow}>
            {showAuthor && !commit.isWorkingChanges && !commit.isStash ? (
              <span className={styles.authorCell}>{commit.authorName}</span>
            ) : null}

            {showMessage ? (
              <div className={styles.messageCell}>
                <strong
                  className={
                    commit.isStash
                      ? styles.stashMessage
                      : commit.isWorkingChanges
                        ? styles.workingChangesMessage
                        : undefined
                  }
                >
                  {commit.message}
                </strong>
              </div>
            ) : null}

            {showDate && !commit.isWorkingChanges && !commit.isStash ? (
              <span className={styles.dateCell}>{formatDateLabel(commit.authoredAt)}</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </button>
  );
}
