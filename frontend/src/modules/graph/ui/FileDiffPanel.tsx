import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { InfoCard } from "@core/components/InfoCard";
import { readFileDiff } from "@modules/graph/application/use-cases/readFileDiff";
import { createFileDiffReader } from "@modules/graph/infrastructure/FileDiffReaderProvider";
import { parseDiffText } from "@modules/graph/lib/parseDiffText";
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

  const diffLines = parseDiffText(diffText);

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

      {!error && diffLines.length === 0 ? (
        <p className={styles.empty}>No diff available for this file.</p>
      ) : null}

      {!error && diffLines.length > 0 ? (
        <pre className={styles.diff}>
          {diffLines.map((line, index) => (
            <div className={styles[`line-${line.type}`]} key={index}>
              {line.content || " "}
            </div>
          ))}
        </pre>
      ) : null}
    </InfoCard>
  );
}
