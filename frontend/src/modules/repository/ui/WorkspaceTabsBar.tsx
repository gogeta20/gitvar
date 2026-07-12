import { Plus, X } from "lucide-react";
import { RepositorySummary } from "@modules/repository/domain/repository";
import styles from "./WorkspaceTabsBar.module.css";

interface WorkspaceTabsBarProps {
  openRepositories: RepositorySummary[];
  activeRepositoryId: string | null;
  onSelectTab: (repositoryId: string) => void;
  onCloseTab: (repositoryId: string) => void;
  onAddTab: () => void;
}

export function WorkspaceTabsBar({
  openRepositories,
  activeRepositoryId,
  onSelectTab,
  onCloseTab,
  onAddTab
}: WorkspaceTabsBarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.optionsRow} />

      <div className={styles.tabsRow}>
        {openRepositories.map((repository) => (
          <button
            className={
              repository.id === activeRepositoryId ? styles.tabActive : styles.tab
            }
            key={repository.id}
            onClick={() => onSelectTab(repository.id)}
            type="button"
          >
            <span className={styles.tabLabel}>{repository.name}</span>
            <span
              className={styles.tabClose}
              onClick={(event) => {
                event.stopPropagation();
                onCloseTab(repository.id);
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
