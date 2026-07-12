import { RepositoryWorkspace } from "@modules/repository/ui/RepositoryWorkspace";
import styles from "./RepositoryWorkspacePage.module.css";

interface RepositoryWorkspacePageProps {
  selectedRepositoryId: string;
}

export function RepositoryWorkspacePage({
  selectedRepositoryId
}: RepositoryWorkspacePageProps) {
  return (
    <div className={styles.page}>
      <RepositoryWorkspace initialRepositoryId={selectedRepositoryId} />
    </div>
  );
}
