import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { InfoCard } from "@core/components/InfoCard";
import { readFileDiff } from "@modules/graph/application/use-cases/readFileDiff";
import { createFileDiffReader } from "@modules/graph/infrastructure/FileDiffReaderProvider";
import { parseDiffHunks } from "@modules/graph/lib/parseDiffHunks";
import styles from "./FileDiffPanel.module.css";

interface FileDiffPanelProps {
  repositoryPath: string;
  commitId: string;
  filePath: string;
  onClose: () => void;
}

export function FileDiffPanel({ repositoryPath, commitId, filePath, onClose }: FileDiffPanelProps) {
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
      headerActions={
        <button className={styles.backButton} onClick={onClose} type="button">
          <ArrowLeft size={14} />
          Back to graph
        </button>
      }
      title={filePath}
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
