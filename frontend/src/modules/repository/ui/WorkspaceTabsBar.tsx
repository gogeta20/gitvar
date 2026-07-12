import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { loadRepositoryWorkspace } from "@modules/repository/application/use-cases/loadRepositoryWorkspace";
import { RepositorySummary } from "@modules/repository/domain/repository";
import { createRepositoryReader } from "@modules/repository/infrastructure/RepositoryReaderProvider";
import styles from "./WorkspaceTabsBar.module.css";

interface WorkspaceTabsBarProps {
  openRepositoryIds: string[];
  activeRepositoryId: string | null;
  onSelectTab: (repositoryId: string) => void;
  onCloseTab: (repositoryId: string) => void;
  onAddTab: () => void;
}

export function WorkspaceTabsBar({
  openRepositoryIds,
  activeRepositoryId,
  onSelectTab,
  onCloseTab,
  onAddTab
}: WorkspaceTabsBarProps) {
  const [repositories, setRepositories] = useState<RepositorySummary[]>([]);

  useEffect(() => {
    const repositoryReader = createRepositoryReader();

    loadRepositoryWorkspace(repositoryReader)
      .then((workspace) => setRepositories(workspace.repositories))
      .catch(() => setRepositories([]));
  }, []);

  function resolveName(repositoryId: string): string {
    return repositories.find((repository) => repository.id === repositoryId)?.name ?? repositoryId;
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.optionsRow} />

      <div className={styles.tabsRow}>
        {openRepositoryIds.map((repositoryId) => (
          <button
            className={
              repositoryId === activeRepositoryId ? styles.tabActive : styles.tab
            }
            key={repositoryId}
            onClick={() => onSelectTab(repositoryId)}
            type="button"
          >
            <span className={styles.tabLabel}>{resolveName(repositoryId)}</span>
            <span
              className={styles.tabClose}
              onClick={(event) => {
                event.stopPropagation();
                onCloseTab(repositoryId);
              }}
              role="button"
              tabIndex={-1}
            >
              <X size={12} />
            </span>
          </button>
        ))}

        <button
          aria-label="Open another repository"
          className={activeRepositoryId === null ? styles.addTabActive : styles.addTab}
          onClick={onAddTab}
          type="button"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className={styles.extrasRow} />
    </div>
  );
}
