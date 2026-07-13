import { useEffect, useState } from "react";
import { ShellLayout } from "@core/layouts/ShellLayout";
import { usePersistedState } from "@core/hooks/usePersistedState";
import { HomePage } from "@pages/HomePage";
import { RepositoryWorkspacePage } from "@pages/RepositoryWorkspacePage";
import { RepositorySummary } from "@modules/repository/domain/repository";
import { WorkspaceTabsBar } from "@modules/repository/ui/WorkspaceTabsBar";
import { SettingsMenu } from "@app/settings/SettingsMenu";
import { ThemeSettingsModal } from "@app/settings/ThemeSettingsModal";
import { DEFAULT_THEME_ID } from "@app/settings/themePresets";

const MAX_RECENT_REPOSITORIES = 8;

export function App() {
  const [themeId, setThemeId] = usePersistedState<string>("gitmap.themeId", DEFAULT_THEME_ID);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeId);
  }, [themeId]);

  const [openRepositories, setOpenRepositories] = usePersistedState<RepositorySummary[]>(
    "gitmap.openRepositories",
    []
  );
  const [activeRepositoryId, setActiveRepositoryId] = usePersistedState<string | null>(
    "gitmap.activeRepositoryId",
    null
  );
  const [recentRepositories, setRecentRepositories] = usePersistedState<RepositorySummary[]>(
    "gitmap.recentRepositories",
    []
  );

  function handleOpenRepository(repository: RepositorySummary) {
    setOpenRepositories((current) =>
      current.some((item) => item.id === repository.id) ? current : [...current, repository]
    );
    setActiveRepositoryId(repository.id);
    setRecentRepositories((current) => {
      const withoutDuplicate = current.filter((item) => item.id !== repository.id);
      return [repository, ...withoutDuplicate].slice(0, MAX_RECENT_REPOSITORIES);
    });
  }

  function handleCloseTab(repositoryId: string) {
    setOpenRepositories((current) => current.filter((item) => item.id !== repositoryId));
    setActiveRepositoryId((current) => (current === repositoryId ? null : current));
  }

  const activeRepository = openRepositories.find((item) => item.id === activeRepositoryId) ?? null;

  return (
    <>
      <ShellLayout
        headerActions={<SettingsMenu onOpenStyleSettings={() => setIsStyleModalOpen(true)} />}
      >
        <WorkspaceTabsBar
          activeRepositoryId={activeRepositoryId}
          onAddTab={() => setActiveRepositoryId(null)}
          onCloseTab={handleCloseTab}
          onSelectTab={setActiveRepositoryId}
          openRepositories={openRepositories}
        />

        {activeRepository ? (
          <RepositoryWorkspacePage repository={activeRepository} />
        ) : (
          <HomePage onOpenRepository={handleOpenRepository} recentRepositories={recentRepositories} />
        )}
      </ShellLayout>

      {isStyleModalOpen ? (
        <ThemeSettingsModal
          activeThemeId={themeId}
          onClose={() => setIsStyleModalOpen(false)}
          onSelectTheme={setThemeId}
        />
      ) : null}
    </>
  );
}
