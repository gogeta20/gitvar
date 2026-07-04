import { RepositoryWorkspace } from "@modules/repository/ui/RepositoryWorkspace";
import styles from "./RepositoryWorkspacePage.module.css";

interface RepositoryWorkspacePageProps {
  selectedRepositoryId: string;
  onBack: () => void;
}

export function RepositoryWorkspacePage({
  selectedRepositoryId,
  onBack
}: RepositoryWorkspacePageProps) {
  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <button className={styles.backButton} onClick={onBack} type="button">
          Back to repositories
        </button>
        <p className={styles.caption}>
          Mock flow active. Selecting a repository opens the full workspace.
        </p>
      </div>

      <RepositoryWorkspace initialRepositoryId={selectedRepositoryId} />
    </div>
  );
}

