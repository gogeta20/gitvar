import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Trash2,
  Undo2
} from "lucide-react";
import { IconButton } from "@core/components/IconButton";
import { InfoCard } from "@core/components/InfoCard";
import { discardHunk } from "@modules/graph/application/use-cases/discardHunk";
import { readFileDiff } from "@modules/graph/application/use-cases/readFileDiff";
import { stageHunk } from "@modules/graph/application/use-cases/stageHunk";
import { unstageHunk } from "@modules/graph/application/use-cases/unstageHunk";
import { DiffHunk } from "@modules/graph/domain/diffHunk";
import { WORKING_CHANGES_COMMIT_ID } from "@modules/graph/domain/workingStatus";
import { createFileDiffReader } from "@modules/graph/infrastructure/FileDiffReaderProvider";
import { createWorkingChangesWriter } from "@modules/graph/infrastructure/WorkingChangesWriterProvider";
import { buildHunkPatchText } from "@modules/graph/lib/buildHunkPatchText";
import { parseDiffHunks } from "@modules/graph/lib/parseDiffHunks";
import styles from "./FileDiffPanel.module.css";

interface FileDiffPanelProps {
  repositoryPath: string;
  commitId: string;
  filePath: string;
  isSidebarOpen: boolean;
  isDetailOpen: boolean;
  onToggleSidebar: () => void;
  onToggleDetail: () => void;
  onClose: () => void;
}

export function FileDiffPanel({
  repositoryPath,
  commitId,
  filePath,
  isSidebarOpen,
  isDetailOpen,
  onToggleSidebar,
  onToggleDetail,
  onClose
}: FileDiffPanelProps) {
  const [diffText, setDiffText] = useState("");
  const [stagedDiffText, setStagedDiffText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isWorkingChanges = commitId === WORKING_CHANGES_COMMIT_ID;

  const refreshDiff = useCallback(() => {
    const fileDiffReader = createFileDiffReader();

    setError(null);

    const unstagedDiff = readFileDiff(fileDiffReader, repositoryPath, commitId, filePath, false)
      .then(setDiffText)
      .catch((currentError: unknown) => {
        setDiffText("");
        setError(
          currentError instanceof Error ? currentError.message : "Unexpected error."
        );
      });

    if (!isWorkingChanges) {
      setStagedDiffText("");
      return unstagedDiff;
    }

    const stagedDiff = readFileDiff(fileDiffReader, repositoryPath, commitId, filePath, true).then(
      setStagedDiffText
    );

    return Promise.all([unstagedDiff, stagedDiff]).then(() => undefined);
  }, [repositoryPath, commitId, filePath, isWorkingChanges]);

  useEffect(() => {
    refreshDiff();
  }, [refreshDiff]);

  function handleActionError(currentError: unknown) {
    setError(currentError instanceof Error ? currentError.message : "Unexpected error.");
  }

  function handleStageHunk(hunk: DiffHunk) {
    const workingChangesWriter = createWorkingChangesWriter();
    const patch = buildHunkPatchText(hunk);

    stageHunk(workingChangesWriter, repositoryPath, filePath, patch)
      .then(refreshDiff)
      .catch(handleActionError);
  }

  function handleDiscardHunk(hunk: DiffHunk) {
    if (!window.confirm("Discard this hunk? This cannot be undone.")) {
      return;
    }

    const workingChangesWriter = createWorkingChangesWriter();
    const patch = buildHunkPatchText(hunk);

    discardHunk(workingChangesWriter, repositoryPath, filePath, patch)
      .then(refreshDiff)
      .catch(handleActionError);
  }

  function handleUnstageHunk(hunk: DiffHunk) {
    const workingChangesWriter = createWorkingChangesWriter();
    const patch = buildHunkPatchText(hunk);

    unstageHunk(workingChangesWriter, repositoryPath, filePath, patch)
      .then(refreshDiff)
      .catch(handleActionError);
  }

  const hunks = parseDiffHunks(diffText);
  const stagedHunks = isWorkingChanges ? parseDiffHunks(stagedDiffText) : [];

  function renderHunk(hunk: DiffHunk, hunkIndex: number, staged: boolean) {
    return (
      <div className={styles.hunk} key={hunkIndex}>
        <div className={styles.hunkHeader}>
          <span className={styles.hunkHeaderLabel}>{hunk.header}</span>

          {isWorkingChanges ? (
            <div className={styles.hunkActions}>
              {staged ? (
                <button
                  aria-label="Unstage hunk"
                  className={`${styles.hunkActionButton} ${styles.hunkActionButtonUnstage}`}
                  onClick={() => handleUnstageHunk(hunk)}
                  title="Unstage this hunk"
                  type="button"
                >
                  <Undo2 size={12} />
                </button>
              ) : (
                <>
                  <button
                    aria-label="Stage hunk"
                    className={`${styles.hunkActionButton} ${styles.hunkActionButtonStage}`}
                    onClick={() => handleStageHunk(hunk)}
                    title="Stage this hunk"
                    type="button"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    aria-label="Discard hunk"
                    className={`${styles.hunkActionButton} ${styles.hunkActionButtonDiscard}`}
                    onClick={() => handleDiscardHunk(hunk)}
                    title="Discard this hunk"
                    type="button"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
        {hunk.lines.map((line, lineIndex) => (
          <div
            className={`${styles.hunkLine} ${styles[`hunkLine-${line.type}`]}`}
            key={lineIndex}
          >
            <span className={styles.lineNumber}>{line.oldLineNumber ?? ""}</span>
            <span className={styles.lineNumber}>{line.newLineNumber ?? ""}</span>
            <span className={styles.lineContent}>{line.content || " "}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <InfoCard
      fillHeight
      title={
        <div className={styles.headerCluster}>
          <IconButton
            icon={isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            onClick={onToggleSidebar}
          />
          <span className={styles.filePathTitle}>{filePath}</span>
        </div>
      }
      headerActions={
        <div className={styles.headerCluster}>
          <button className={styles.backButton} onClick={onClose} type="button">
            <ArrowLeft size={14} />
            Back to graph
          </button>
          <IconButton
            icon={isDetailOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            label={isDetailOpen ? "Hide commit detail panel" : "Show commit detail panel"}
            onClick={onToggleDetail}
          />
        </div>
      }
    >
      {error ? <p className={styles.error}>{error}</p> : null}

      {!error && !isWorkingChanges && hunks.length === 0 ? (
        <p className={styles.empty}>No diff available for this file.</p>
      ) : null}

      {!error && isWorkingChanges ? (
        <>
          <div className={styles.hunkSectionHeader}>Staged ({stagedHunks.length})</div>
          {stagedHunks.length === 0 ? (
            <p className={styles.empty}>Nothing staged yet.</p>
          ) : (
            <div className={styles.hunkList}>
              {stagedHunks.map((hunk, hunkIndex) => renderHunk(hunk, hunkIndex, true))}
            </div>
          )}

          <div className={styles.hunkSectionHeader}>Changes ({hunks.length})</div>
          {hunks.length === 0 ? (
            <p className={styles.empty}>No unstaged changes.</p>
          ) : (
            <div className={styles.hunkList}>
              {hunks.map((hunk, hunkIndex) => renderHunk(hunk, hunkIndex, false))}
            </div>
          )}
        </>
      ) : (
        <div className={styles.hunkList}>
          {hunks.map((hunk, hunkIndex) => renderHunk(hunk, hunkIndex, false))}
        </div>
      )}
    </InfoCard>
  );
}
