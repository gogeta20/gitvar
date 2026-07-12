import { RepositorySummary } from "@modules/repository/domain/repository";
import { RepositoryWorkspace } from "@modules/repository/ui/RepositoryWorkspace";
import styles from "./RepositoryWorkspacePage.module.css";

interface RepositoryWorkspacePageProps {
  repository: RepositorySummary;
}

export function RepositoryWorkspacePage({ repository }: RepositoryWorkspacePageProps) {
  return (
    <div className={styles.page}>
      <RepositoryWorkspace repository={repository} />
    </div>
  );
}
