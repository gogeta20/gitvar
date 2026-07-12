import { useEffect, useState } from "react";
import { InfoCard } from "@core/components/InfoCard";
import { readStash } from "@modules/stash/application/use-cases/readStash";
import { StashEntry } from "@modules/stash/domain/stashEntry";
import { createStashReader } from "@modules/stash/infrastructure/StashReaderProvider";
import styles from "./StashPanel.module.css";

interface StashPanelProps {
  repositoryPath: string;
  embedded?: boolean;
}

export function StashPanel({ repositoryPath, embedded = false }: StashPanelProps) {
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
            <div className={styles.stashItem} key={entry.reference}>
              <div className={styles.stashItemTopRow}>
                <span className={styles.stashItemTitle}>{entry.reference}</span>
                <span className={styles.stashItemDate}>{entry.relativeDate}</span>
              </div>
              <span className={styles.stashItemMessage}>{entry.message}</span>
            </div>
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
