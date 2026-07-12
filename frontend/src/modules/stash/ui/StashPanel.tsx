import { useEffect, useState } from "react";
import { InfoCard } from "@core/components/InfoCard";
import { readStash } from "@modules/stash/application/use-cases/readStash";
import { StashEntry } from "@modules/stash/domain/stashEntry";
import { createStashReader } from "@modules/stash/infrastructure/StashReaderProvider";
import styles from "./StashPanel.module.css";

function formatCreatedAt(input: string): string {
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

interface StashPanelProps {
  repositoryPath: string;
  selectedCommitId?: string | null;
  onSelectStash?: (entry: StashEntry) => void;
  embedded?: boolean;
}

export function StashPanel({
  repositoryPath,
  selectedCommitId = null,
  onSelectStash,
  embedded = false
}: StashPanelProps) {
  const [entries, setEntries] = useState<StashEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stashReader = createStashReader();

    setError(null);

    readStash(stashReader, repositoryPath)
      .then(setEntries)
      .catch((currentError: unknown) => {
        setEntries([]);
        setError(
          currentError instanceof Error ? currentError.message : "Unexpected error."
        );
      });
  }, [repositoryPath]);

  const content = (
    <>
      {error ? <p className={styles.error}>{error}</p> : null}

      {!error && entries.length > 0 ? (
        <div className={styles.stashList}>
          {entries.map((entry) => (
            <button
              className={
                entry.commitId === selectedCommitId
                  ? styles.stashItemSelected
                  : styles.stashItem
              }
              key={entry.reference}
              onClick={() => onSelectStash?.(entry)}
              type="button"
            >
              <span className={styles.stashItemIndex}>#{entry.index}</span>
              <span
                className={styles.stashItemMessage}
                title={`${entry.reference} · ${formatCreatedAt(entry.createdAt)}`}
              >
                {entry.message}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {!error && entries.length === 0 ? <p className={styles.empty}>No stash entries.</p> : null}
    </>
  );

  if (embedded) {
    return content;
  }

  return <InfoCard title="Stash">{content}</InfoCard>;
}
