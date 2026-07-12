import { useEffect, useState } from "react";
import {
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen
} from "lucide-react";
import { IconButton } from "@core/components/IconButton";
import { InfoCard } from "@core/components/InfoCard";
import { readFileDiff } from "@modules/graph/application/use-cases/readFileDiff";
import { createFileDiffReader } from "@modules/graph/infrastructure/FileDiffReaderProvider";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fileDiffReader = createFileDiffReader();

    setError(null);

    readFileDiff(fileDiffReader, repositoryPath, commitId, filePath)
      .then(setDiffText)
      .catch((currentError: unknown) => {
        setDiffText("");
        setError(
          currentError instanceof Error ? currentError.message : "Unexpected error."
        );
      });
  }, [repositoryPath, commitId, filePath]);

  const hunks = parseDiffHunks(diffText);

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

      {!error && hunks.length === 0 ? (
        <p className={styles.empty}>No diff available for this file.</p>
      ) : null}

      <div className={styles.hunkList}>
        {hunks.map((hunk, hunkIndex) => (
          <div className={styles.hunk} key={hunkIndex}>
            <div className={styles.hunkHeader}>{hunk.header}</div>
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
        ))}
      </div>
    </InfoCard>
  );
}
