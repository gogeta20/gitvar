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
const LEGACY_BROWSE_ROOT = "/host/projects";
const DEFAULT_BROWSE_ROOT = "/host/home/projects";

function migrateRepositoryPath(path: string): string {
  return path.startsWith(LEGACY_BROWSE_ROOT)
    ? `${DEFAULT_BROWSE_ROOT}${path.slice(LEGACY_BROWSE_ROOT.length)}`
    : path;
}

function migrateRepository(repository: RepositorySummary): RepositorySummary {
  const nextPath = migrateRepositoryPath(repository.path);

  if (nextPath === repository.path && repository.id === repository.path) {
    return repository;
  }

  return {
    ...repository,
    id: repository.id === repository.path ? nextPath : repository.id,
    path: nextPath
  };
}

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

  useEffect(() => {
    setOpenRepositories((current) => current.map(migrateRepository));
    setRecentRepositories((current) => current.map(migrateRepository));
    setActiveRepositoryId((current) => (current ? migrateRepositoryPath(current) : current));
  }, [setActiveRepositoryId, setOpenRepositories, setRecentRepositories]);

  function handleOpenRepository(repository: RepositorySummary) {
    const normalizedRepository = migrateRepository(repository);

    setOpenRepositories((current) =>
      current.some((item) => item.id === normalizedRepository.id)
        ? current
        : [...current, normalizedRepository]
    );
    setActiveRepositoryId(normalizedRepository.id);
    setRecentRepositories((current) => {
      const withoutDuplicate = current.filter((item) => item.id !== normalizedRepository.id);
      return [normalizedRepository, ...withoutDuplicate].slice(0, MAX_RECENT_REPOSITORIES);
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
