import { useEffect, useState } from "react";
import { InfoCard } from "@core/components/InfoCard";
import { loadRepositoryWorkspace } from "@modules/repository/application/use-cases/loadRepositoryWorkspace";
import { RepositorySummary } from "@modules/repository/domain/repository";
import { createRepositoryReader } from "@modules/repository/infrastructure/RepositoryReaderProvider";
import styles from "./RepositoryPicker.module.css";

interface RepositoryPickerProps {
  onOpenRepository: (repositoryId: string) => void;
}

export function RepositoryPicker({ onOpenRepository }: RepositoryPickerProps) {
  const [repositories, setRepositories] = useState<RepositorySummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const repositoryReader = createRepositoryReader();

    loadRepositoryWorkspace(repositoryReader)
      .then((workspace) => {
        setRepositories(workspace.repositories);
      })
      .catch((currentError: unknown) => {
        setError(
          currentError instanceof Error ? currentError.message : "Unexpected error."
        );
      });
  }, []);

  if (error) {
    return <InfoCard title="Repository picker">{error}</InfoCard>;
  }

  return (
    <div className={styles.picker}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Workspace</p>
          <h2 className={styles.title}>Open a repository to enter the graph view</h2>
        </div>
        <p className={styles.copy}>
          Start with a focused repo selection. Once selected, GitMap opens a full
          width workspace with branches, graph and change detail.
        </p>
      </section>

      <InfoCard title="Recent repositories">
        <div className={styles.list}>
          {repositories.map((repository) => (
            <button
              key={repository.id}
              className={styles.card}
              onClick={() => onOpenRepository(repository.id)}
              type="button"
            >
              <div className={styles.topline}>
                <strong>{repository.name}</strong>
                <span>{repository.status}</span>
              </div>
              <p>{repository.path}</p>
              <div className={styles.meta}>
                <span>{repository.currentBranch}</span>
                <span>
                  ↑{repository.ahead} ↓{repository.behind}
                </span>
              </div>
            </button>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}

