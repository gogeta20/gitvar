import { useEffect } from "react";
import { ShellLayout } from "@core/layouts/ShellLayout";
import { usePersistedState } from "@core/hooks/usePersistedState";
import { HomePage } from "@pages/HomePage";
import { RepositoryWorkspacePage } from "@pages/RepositoryWorkspacePage";
import { RepositorySummary } from "@modules/repository/domain/repository";
import { WorkspaceTabsBar } from "@modules/repository/ui/WorkspaceTabsBar";

const MAX_RECENT_REPOSITORIES = 8;

export function App() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dracula");
  }, []);

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
    <ShellLayout title={activeRepository ? "Repository workspace" : "Choose a repository"}>
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
  );
}
