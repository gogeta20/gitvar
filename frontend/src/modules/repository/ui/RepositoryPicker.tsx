import { FolderGit2 } from "lucide-react";
import { InfoCard } from "@core/components/InfoCard";
import { RepositorySummary } from "@modules/repository/domain/repository";
import { FolderBrowser } from "@modules/repository/ui/FolderBrowser";
import styles from "./RepositoryPicker.module.css";

interface RepositoryPickerProps {
  recentRepositories: RepositorySummary[];
  onOpenRepository: (repository: RepositorySummary) => void;
}

export function RepositoryPicker({ recentRepositories, onOpenRepository }: RepositoryPickerProps) {
  return (
    <div className={styles.columns}>
      <FolderBrowser onOpenRepository={onOpenRepository} />

      <InfoCard fillHeight title="Recent repositories">
        {recentRepositories.length > 0 ? (
          <div className={styles.recentList}>
            {recentRepositories.map((repository) => (
              <button
                className={styles.recentItem}
                key={repository.id}
                onClick={() => onOpenRepository(repository)}
                type="button"
              >
                <FolderGit2 size={15} />
                <span className={styles.recentName}>{repository.name}</span>
                <span className={styles.recentPath}>{repository.path}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No repositories opened yet.</p>
        )}
      </InfoCard>
    </div>
  );
}
