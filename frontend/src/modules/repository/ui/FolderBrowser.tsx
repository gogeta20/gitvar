import { useEffect, useState } from "react";
import { ArrowUp, Folder, FolderGit2, Home } from "lucide-react";
import { InfoCard } from "@core/components/InfoCard";
import { browseDirectory } from "@modules/repository/application/use-cases/browseDirectory";
import { DirectoryListing } from "@modules/repository/domain/directoryListing";
import { createDirectoryBrowser } from "@modules/repository/infrastructure/DirectoryBrowserProvider";
import { RepositorySummary } from "@modules/repository/domain/repository";
import styles from "./FolderBrowser.module.css";

interface FolderBrowserProps {
  onOpenRepository: (repository: RepositorySummary) => void;
}

function repositoryNameFromPath(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

export function FolderBrowser({ onOpenRepository }: FolderBrowserProps) {
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined);
  const [listing, setListing] = useState<DirectoryListing | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const directoryBrowser = createDirectoryBrowser();

    setError(null);

    browseDirectory(directoryBrowser, currentPath)
      .then(setListing)
      .catch((currentError: unknown) => {
        setListing(null);
        setError(
          currentError instanceof Error ? currentError.message : "Unexpected error."
        );
      });
  }, [currentPath]);

  function handleOpenRepository(path: string) {
    onOpenRepository({
      id: path,
      name: repositoryNameFromPath(path),
      path,
      currentBranch: "",
      status: "clean",
      ahead: 0,
      behind: 0
    });
  }

  return (
    <InfoCard fillHeight title="Open a folder">
      <div className={styles.pathRow}>
        <button
          aria-label="Back to the default starting folder"
          className={styles.upButton}
          onClick={() => setCurrentPath(undefined)}
          title="Back to the default starting folder"
          type="button"
        >
          <Home size={14} />
        </button>
        <button
          className={styles.upButton}
          disabled={!listing?.parentPath}
          onClick={() => setCurrentPath(listing?.parentPath ?? undefined)}
          title="Up one level"
          type="button"
        >
          <ArrowUp size={14} />
        </button>
        <span className={styles.currentPath}>{listing?.currentPath ?? "..."}</span>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      {!error && listing ? (
        <div className={styles.entryList}>
          {listing.entries.map((entry) =>
            entry.isGitRepo ? (
              <button
                className={styles.entryRepo}
                key={entry.path}
                onClick={() => handleOpenRepository(entry.path)}
                type="button"
              >
                <FolderGit2 size={15} />
                <span className={styles.entryName}>{entry.name}</span>
                <span className={styles.repoBadge}>Open repository</span>
              </button>
            ) : (
              <button
                className={styles.entryFolder}
                key={entry.path}
                onClick={() => setCurrentPath(entry.path)}
                type="button"
              >
                <Folder size={15} />
                <span className={styles.entryName}>{entry.name}</span>
              </button>
            )
          )}

          {listing.entries.length === 0 ? (
            <p className={styles.empty}>No subfolders here.</p>
          ) : null}
        </div>
      ) : null}
    </InfoCard>
  );
}
